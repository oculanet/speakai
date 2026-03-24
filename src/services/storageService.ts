/**
 * storageService.ts
 *
 * Thin wrappers around AsyncStorage for the two persisted values:
 *   - Daily usage counter (auto-resets every calendar day)
 *   - User's preferred tone
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { DailyUsageRecord, ToneType } from '../utils/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string (local time). */
function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Daily Usage ─────────────────────────────────────────────────────────────

/**
 * Returns the current usage record.
 * If the stored record is for a previous day it is reset to zero.
 */
export async function getDailyUsage(): Promise<DailyUsageRecord> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_USAGE);
    if (raw) {
      const record: DailyUsageRecord = JSON.parse(raw);
      if (record.date === todayString()) {
        return record;
      }
    }
  } catch {
    // Ignore parse errors – treat as fresh start.
  }
  return { date: todayString(), count: 0 };
}

/**
 * Increments today's rewrite count by one and persists it.
 * Returns the updated record.
 */
export async function incrementDailyUsage(): Promise<DailyUsageRecord> {
  const current = await getDailyUsage();
  const updated: DailyUsageRecord = { ...current, count: current.count + 1 };
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(updated));
  return updated;
}

/**
 * Resets today's count to zero (used in tests / debug builds).
 */
export async function resetDailyUsage(): Promise<void> {
  const reset: DailyUsageRecord = { date: todayString(), count: 0 };
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(reset));
}

// ─── Tone Preference ─────────────────────────────────────────────────────────

/**
 * Persists the user's selected tone.
 */
export async function saveTonePreference(tone: ToneType): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PREFERRED_TONE, tone);
}

/**
 * Returns the stored tone preference, or null if none is saved.
 */
export async function loadTonePreference(): Promise<ToneType | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PREFERRED_TONE);
    return value ? (value as ToneType) : null;
  } catch {
    return null;
  }
}
