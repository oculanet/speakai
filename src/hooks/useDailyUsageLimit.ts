/**
 * useDailyUsageLimit.ts
 *
 * Custom hook that tracks how many rewrites the user has performed today and
 * exposes helpers to increment or check the limit.
 *
 * State is backed by AsyncStorage via storageService so it survives app
 * restarts.  The count resets automatically the next calendar day.
 */

import { useCallback, useEffect, useState } from 'react';
import { MAX_DAILY_REWRITES } from '../utils/constants';
import {
  getDailyUsage,
  incrementDailyUsage,
  resetDailyUsage,
} from '../services/storageService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseDailyUsageLimitReturn {
  /** Number of rewrites used today. */
  usageCount: number;
  /** True when the user has reached MAX_DAILY_REWRITES. */
  isLimitReached: boolean;
  /** Remaining rewrites for today. */
  remaining: number;
  /** Call before performing a rewrite to increment the counter. */
  recordUsage: () => Promise<void>;
  /** Resets the counter to zero (debug / test helper). */
  resetUsage: () => Promise<void>;
  /** True while the initial usage data is being loaded from storage. */
  isLoading: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDailyUsageLimit(): UseDailyUsageLimitReturn {
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted count on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const record = await getDailyUsage();
        if (!cancelled) setUsageCount(record.count);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recordUsage = useCallback(async () => {
    const updated = await incrementDailyUsage();
    setUsageCount(updated.count);
  }, []);

  const resetUsage = useCallback(async () => {
    await resetDailyUsage();
    setUsageCount(0);
  }, []);

  return {
    usageCount,
    isLimitReached: usageCount >= MAX_DAILY_REWRITES,
    remaining: Math.max(0, MAX_DAILY_REWRITES - usageCount),
    recordUsage,
    resetUsage,
    isLoading,
  };
}
