/**
 * Application-wide constants for SpeakEasy AI.
 *
 * Keeping magic numbers and strings here makes it trivial to adjust limits,
 * API endpoints and other config without hunting through component files.
 */

import type { ToneType } from './types';

// ─── Usage Limits ────────────────────────────────────────────────────────────

/** Maximum rewrites the user may perform in a single calendar day. */
export const MAX_DAILY_REWRITES = 50;

// ─── AsyncStorage Keys ───────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  /** Stores a DailyUsageRecord (JSON). */
  DAILY_USAGE: '@speakeasy/daily_usage',
  /** Stores the user's last-selected ToneType string. */
  PREFERRED_TONE: '@speakeasy/preferred_tone',
} as const;

// ─── Tone Metadata ───────────────────────────────────────────────────────────

export interface ToneOption {
  key: ToneType;
  label: string;
  description: string;
  /** Emoji used as a quick visual cue in the selector. */
  emoji: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    key: 'professional',
    label: 'Professional',
    description: 'Formal, confident, and business-appropriate language.',
    emoji: '💼',
  },
  {
    key: 'friendly',
    label: 'Friendly',
    description: 'Warm, approachable, and conversational.',
    emoji: '😊',
  },
  {
    key: 'polite',
    label: 'Polite',
    description: 'Respectful and courteous in every situation.',
    emoji: '🙏',
  },
  {
    key: 'short',
    label: 'Short & Clear',
    description: 'Concise and to the point, no fluff.',
    emoji: '⚡',
  },
];

/** Convenience map of tone key → full metadata. */
export const TONE_DESCRIPTIONS: Record<ToneType, ToneOption> = TONE_OPTIONS.reduce(
  (acc, t) => ({ ...acc, [t.key]: t }),
  {} as Record<ToneType, ToneOption>,
);

// ─── Text Input Limits ───────────────────────────────────────────────────────

export const MAX_INPUT_CHARS = 500;

// ─── AI API Configuration ────────────────────────────────────────────────────

/**
 * HuggingFace Inference API endpoint for text generation.
 * Swap model slug here without touching the service code.
 */
export const HF_TEXT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

/**
 * HuggingFace Inference API endpoint for speech-to-text (Whisper).
 */
export const HF_WHISPER_MODEL = 'openai/whisper-small';

/** OpenAI chat-completions model to use when EXPO_PUBLIC_AI_PROVIDER=openai. */
export const OPENAI_TEXT_MODEL = 'gpt-3.5-turbo';

export const AI_API_CONFIG = {
  huggingface: {
    textEndpoint: `https://api-inference.huggingface.co/models/${HF_TEXT_MODEL}`,
    whisperEndpoint: `https://api-inference.huggingface.co/models/${HF_WHISPER_MODEL}`,
  },
  openai: {
    textEndpoint: 'https://api.openai.com/v1/chat/completions',
  },
} as const;

// ─── Audio Recording ─────────────────────────────────────────────────────────

/** Maximum recording duration (ms) before auto-stop. */
export const MAX_RECORDING_DURATION_MS = 30_000;
