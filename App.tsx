/**
 * App.tsx – SpeakEasy AI
 *
 * Single-screen application entry point.
 *
 * Responsibilities:
 *  - Owns the top-level UI state (input text, selected tone, loading flags,
 *    rewrite output).
 *  - Orchestrates the AI rewrite flow.
 *  - Orchestrates the speech-to-text flow.
 *  - Persists and restores the user's tone preference via storageService.
 *  - Enforces the daily usage limit via the useDailyUsageLimit hook.
 */

import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// Components
import { Header } from './src/components/Header';
import { OutputArea } from './src/components/OutputArea';
import { RewriteButton } from './src/components/RewriteButton';
import { TextInputSection } from './src/components/TextInputSection';
import { ToneSelector } from './src/components/ToneSelector';

// Services & hooks
import { rewriteText } from './src/services/aiRewriteService';
import { speechService } from './src/services/speechService';
import { loadTonePreference, saveTonePreference } from './src/services/storageService';
import { useDailyUsageLimit } from './src/hooks/useDailyUsageLimit';

// Utils
import { MAX_INPUT_CHARS } from './src/utils/constants';
import type { RewriteOutput, ToneType } from './src/utils/types';

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────

  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('professional');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [output, setOutput] = useState<RewriteOutput | null>(null);

  const {
    usageCount,
    isLimitReached,
    remaining,
    recordUsage,
    isLoading: isLoadingUsage,
  } = useDailyUsageLimit();

  // ── Restore tone preference on mount ──────────────────────────────────────

  useEffect(() => {
    loadTonePreference().then((saved) => {
      if (saved) setSelectedTone(saved);
    });
  }, []);

  // ── Tone change ────────────────────────────────────────────────────────────

  const handleToneChange = useCallback(async (tone: ToneType) => {
    setSelectedTone(tone);
    await saveTonePreference(tone);
  }, []);

  // ── AI Rewrite ─────────────────────────────────────────────────────────────

  const handleRewrite = useCallback(async () => {
    if (!inputText.trim()) {
      Alert.alert('Empty input', 'Please type or speak a message first.');
      return;
    }
    if (isLimitReached) {
      Alert.alert(
        'Daily limit reached',
        `You have used all ${usageCount} rewrites for today. Come back tomorrow!`,
      );
      return;
    }

    setIsRewriting(true);
    setOutput(null);

    try {
      const result = await rewriteText(inputText, selectedTone);
      await recordUsage();
      setOutput(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      Alert.alert('Rewrite failed', message, [{ text: 'OK' }]);
    } finally {
      setIsRewriting(false);
    }
  }, [inputText, selectedTone, isLimitReached, usageCount, recordUsage]);

  // ── Speech-to-Text ─────────────────────────────────────────────────────────

  const handleStartListening = useCallback(async () => {
    try {
      await speechService.startRecording();
      setIsListening(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not start recording.';
      Alert.alert('Microphone error', message);
    }
  }, []);

  const handleStopListening = useCallback(async () => {
    setIsListening(false);
    setIsTranscribing(true);

    try {
      const result = await speechService.stopRecordingAndTranscribe();
      if (result.success && result.transcript) {
        // Append transcribed text, respecting the character limit.
        setInputText((prev) => {
          const combined = prev ? `${prev} ${result.transcript}` : result.transcript;
          return combined.slice(0, MAX_INPUT_CHARS);
        });
      } else if (!result.success) {
        Alert.alert('Transcription failed', result.error ?? 'Could not transcribe audio.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription error.';
      Alert.alert('Error', message);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  // ── Derived UI state ───────────────────────────────────────────────────────

  const rewriteDisabled =
    isRewriting ||
    isLimitReached ||
    !inputText.trim();

  const disabledReason = isLimitReached
    ? `Daily limit reached (${usageCount} rewrites used). Resets tomorrow.`
    : !inputText.trim()
    ? ''
    : undefined;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#6C63FF" />

      <Header usageCount={usageCount} isLoadingUsage={isLoadingUsage} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Text Input */}
          <View style={styles.section}>
            <TextInputSection
              value={inputText}
              onChangeText={setInputText}
              isListening={isListening}
              isTranscribing={isTranscribing}
              isRewriting={isRewriting}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
            />
          </View>

          {/* Tone Selector */}
          <View style={styles.section}>
            <ToneSelector
              selectedTone={selectedTone}
              onToneChange={handleToneChange}
              disabled={isRewriting}
            />
          </View>

          {/* Rewrite Button */}
          <View style={styles.section}>
            <RewriteButton
              onPress={handleRewrite}
              isLoading={isRewriting}
              disabled={rewriteDisabled}
              disabledReason={disabledReason}
            />
          </View>

          {/* Output */}
          {output && (
            <View style={styles.section}>
              <OutputArea output={output} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6C63FF',
  },
  flex: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    // Provides a consistent vertical rhythm between sections.
  },
});
