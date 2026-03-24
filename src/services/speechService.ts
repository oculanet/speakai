/**
 * speechService.ts
 *
 * Handles microphone recording and speech-to-text transcription.
 *
 * Strategy:
 *  1. Request RECORD_AUDIO permission via expo-av.
 *  2. Record audio in m4a format (natively supported on Android).
 *  3. Read the recorded file as a Base64 blob.
 *  4. POST it to the HuggingFace Whisper model endpoint.
 *  5. Return the transcript (or an error result).
 *
 * If no API key is configured the service returns an instructive error so the
 * user knows exactly what to do.
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AI_API_CONFIG, MAX_RECORDING_DURATION_MS } from '../utils/constants';
import type { SpeechRecognitionResult } from '../utils/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpeechService {
  /** True while recording is in progress. */
  isRecording: boolean;
  /** Start a new recording session. Resolves when recording begins. */
  startRecording(): Promise<void>;
  /**
   * Stop the active recording session and transcribe the audio.
   * Resolves with the transcription result.
   */
  stopRecordingAndTranscribe(): Promise<SpeechRecognitionResult>;
}

// ─── Module-level state ──────────────────────────────────────────────────────

let recording: Audio.Recording | null = null;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Permission ──────────────────────────────────────────────────────────────

async function requestPermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Transcription via HuggingFace Whisper ───────────────────────────────────

async function transcribeAudio(uri: string): Promise<SpeechRecognitionResult> {
  const apiKey = process.env.EXPO_PUBLIC_AI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      transcript: '',
      error:
        'No API key configured. Add EXPO_PUBLIC_AI_API_KEY to your .env file.',
    };
  }

  try {
    // Read the recorded file as Base64 so we can send it as binary.
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert Base64 → binary Uint8Array for the multipart body.
    const binaryAudio = Uint8Array.from(atob(base64Audio), (c) =>
      c.charCodeAt(0),
    );

    const response = await fetch(AI_API_CONFIG.huggingface.whisperEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'audio/m4a',
      },
      body: binaryAudio,
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        transcript: '',
        error: `Transcription failed (${response.status}): ${text}`,
      };
    }

    const data = (await response.json()) as { text?: string };
    return {
      success: true,
      transcript: (data.text ?? '').trim(),
    };
  } catch (err) {
    return {
      success: false,
      transcript: '',
      error: err instanceof Error ? err.message : 'Unknown transcription error',
    };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const speechService: SpeechService = {
  isRecording: false,

  async startRecording(): Promise<void> {
    // Ensure we are not already recording.
    if (speechService.isRecording) return;

    const granted = await requestPermission();
    if (!granted) {
      throw new Error(
        'Microphone permission denied. Please enable it in Settings.',
      );
    }

    // Configure audio mode for recording.
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    recording = newRecording;
    speechService.isRecording = true;

    // Auto-stop after the maximum allowed duration.
    autoStopTimer = setTimeout(async () => {
      if (speechService.isRecording) {
        await speechService.stopRecordingAndTranscribe();
      }
    }, MAX_RECORDING_DURATION_MS);
  },

  async stopRecordingAndTranscribe(): Promise<SpeechRecognitionResult> {
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      autoStopTimer = null;
    }

    if (!recording) {
      return { success: false, transcript: '', error: 'No active recording.' };
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      speechService.isRecording = false;

      // Restore audio mode.
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!uri) {
        return {
          success: false,
          transcript: '',
          error: 'Recording URI is unavailable.',
        };
      }

      return await transcribeAudio(uri);
    } catch (err) {
      recording = null;
      speechService.isRecording = false;
      return {
        success: false,
        transcript: '',
        error: err instanceof Error ? err.message : 'Failed to stop recording',
      };
    }
  },
};
