/**
 * aiRewriteService.ts
 *
 * Calls an AI API to rewrite the user's text in the chosen tone.
 *
 * Supported providers (set via EXPO_PUBLIC_AI_PROVIDER):
 *   - "huggingface" (default) – HuggingFace Inference API, free tier available.
 *   - "openai"                – OpenAI Chat Completions API.
 *
 * Two independent variations are requested per call so the user can pick their
 * favourite.
 */

import {
  AI_API_CONFIG,
  HF_TEXT_MODEL,
  OPENAI_TEXT_MODEL,
  TONE_DESCRIPTIONS,
} from '../utils/constants';
import type { RewriteOutput, RewriteVariation, ToneType } from '../utils/types';

// ─── Prompt Engineering ──────────────────────────────────────────────────────

/**
 * Builds the instruction prompt for a single variation.
 *
 * @param text    - The original user text.
 * @param tone    - Desired tone.
 * @param variant - 1 or 2 (so the model produces slightly different outputs).
 */
function buildPrompt(text: string, tone: ToneType, variant: 1 | 2): string {
  const { label, description } = TONE_DESCRIPTIONS[tone];

  return (
    `Rewrite the following message in a ${label} tone. ` +
    `${description} ` +
    `Produce variation ${variant} of 2. ` +
    `Return ONLY the rewritten text, nothing else.\n\n` +
    `Original: ${text}`
  );
}

// ─── HuggingFace Provider ────────────────────────────────────────────────────

async function rewriteWithHuggingFace(
  text: string,
  tone: ToneType,
  apiKey: string,
): Promise<[string, string]> {
  const endpoint = AI_API_CONFIG.huggingface.textEndpoint;

  const fetchVariant = async (variant: 1 | 2): Promise<string> => {
    const prompt = buildPrompt(text, tone, variant);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7 + variant * 0.05, // slight temperature difference per variant
          return_full_text: false,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HuggingFace API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as Array<{ generated_text: string }>;
    const raw = data?.[0]?.generated_text ?? '';
    return cleanResponse(raw);
  };

  // Fetch both variants concurrently.
  const [v1, v2] = await Promise.all([fetchVariant(1), fetchVariant(2)]);
  return [v1, v2];
}

// ─── OpenAI Provider ─────────────────────────────────────────────────────────

async function rewriteWithOpenAI(
  text: string,
  tone: ToneType,
  apiKey: string,
): Promise<[string, string]> {
  const endpoint = AI_API_CONFIG.openai.textEndpoint;

  const fetchVariant = async (variant: 1 | 2): Promise<string> => {
    const prompt = buildPrompt(text, tone, variant);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_TEXT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7 + variant * 0.05,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data?.choices?.[0]?.message?.content ?? '';
    return cleanResponse(raw);
  };

  const [v1, v2] = await Promise.all([fetchVariant(1), fetchVariant(2)]);
  return [v1, v2];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strips leading/trailing whitespace and common LLM preamble patterns. */
function cleanResponse(text: string): string {
  return text
    .trim()
    .replace(/^(rewritten text|variation \d+):\s*/i, '')
    .trim();
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Rewrites `inputText` in the given `tone` and returns two variations.
 *
 * @throws {Error} if the API key is missing or the request fails.
 */
export async function rewriteText(
  inputText: string,
  tone: ToneType,
): Promise<RewriteOutput> {
  const apiKey = process.env.EXPO_PUBLIC_AI_API_KEY;
  const provider = (process.env.EXPO_PUBLIC_AI_PROVIDER ?? 'huggingface').toLowerCase();

  if (!apiKey) {
    throw new Error(
      'API key not configured. Add EXPO_PUBLIC_AI_API_KEY to your .env file.',
    );
  }

  const trimmed = inputText.trim();
  if (!trimmed) {
    throw new Error('Please enter some text before rewriting.');
  }

  let v1Text: string;
  let v2Text: string;

  if (provider === 'openai') {
    [v1Text, v2Text] = await rewriteWithOpenAI(trimmed, tone, apiKey);
  } else {
    // Default to HuggingFace
    [v1Text, v2Text] = await rewriteWithHuggingFace(trimmed, tone, apiKey);
  }

  const makeVariation = (text: string): RewriteVariation => ({ text, tone });

  return {
    originalText: trimmed,
    variation1: makeVariation(v1Text),
    variation2: makeVariation(v2Text),
    timestamp: new Date().toISOString(),
  };
}
