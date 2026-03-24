/**
 * Header.tsx
 *
 * Displays the app title and the user's remaining daily rewrite count.
 * Kept intentionally minimal to leave maximum vertical space for the main UI.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_DAILY_REWRITES } from '../utils/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  /** Number of rewrites used today. */
  usageCount: number;
  /** True while usage data is being loaded from storage. */
  isLoadingUsage: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Header: React.FC<HeaderProps> = ({ usageCount, isLoadingUsage }) => {
  const remaining = Math.max(0, MAX_DAILY_REWRITES - usageCount);
  const isNearLimit = remaining <= 5;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SpeakEasy AI</Text>
      <Text
        style={[styles.counter, isNearLimit && styles.counterWarning]}
        accessibilityLabel={`${remaining} rewrites remaining today`}
      >
        {isLoadingUsage ? '…' : `${remaining}/${MAX_DAILY_REWRITES} left today`}
      </Text>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#6C63FF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  counterWarning: {
    color: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
});
