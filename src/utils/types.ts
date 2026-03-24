/**
 * TypeScript type definitions for SpeakEasy AI.
 *
 * Centralising types here avoids circular imports and makes it easy to see
 * the full data-model at a glance.
 */

// ─── Tone ────────────────────────────────────────────────────────────────────

/** The four available rewrite tones. */
export type ToneType = 'professional' | 'friendly' | 'polite' | 'short';

// ─── AI Rewrite ──────────────────────────────────────────────────────────────

/** A single rewritten variation returned by the AI service. */
export interface RewriteVariation {
  /** The rewritten text. */
  text: string;
  /** Tone used to produce this variation. */
  tone: ToneType;
}

/** The complete output from one rewrite request (two variations). */
export interface RewriteOutput {
  /** Original text submitted by the user. */
  originalText: string;
  /** First rewritten variation. */
  variation1: RewriteVariation;
  /** Second rewritten variation. */
  variation2: RewriteVariation;
  /** ISO timestamp when the rewrite was produced. */
  timestamp: string;
}

// ─── Speech Recognition ──────────────────────────────────────────────────────

/** Result returned by the speech-to-text service. */
export interface SpeechRecognitionResult {
  /** Whether the recognition succeeded. */
  success: boolean;
  /** Transcribed text (empty string on failure). */
  transcript: string;
  /** Human-readable error message when success is false. */
  error?: string;
}

// ─── Daily Usage ─────────────────────────────────────────────────────────────

/** Persisted structure tracking today's usage count. */
export interface DailyUsageRecord {
  /** ISO date string (YYYY-MM-DD) for the tracked day. */
  date: string;
  /** Number of rewrites performed today. */
  count: number;
}

// ─── App State ───────────────────────────────────────────────────────────────

/** Props shared by most child components. */
export interface AppState {
  inputText: string;
  selectedTone: ToneType;
  isLoading: boolean;
  isListening: boolean;
  output: RewriteOutput | null;
}
