/**
 * RewriteButton.tsx
 *
 * Primary CTA button that triggers the AI rewrite.
 *
 * States:
 *  - Normal     – purple gradient-like background, white text.
 *  - Loading    – spinner + "Rewriting…" label, non-interactive.
 *  - Disabled   – greyed out when limit is reached or input is empty.
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

// ─── Props ───────────────────────────────────────────────────────────────────

interface RewriteButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
  /** Shown as a tooltip-like sub-label when disabled (e.g. "Daily limit reached"). */
  disabledReason?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const RewriteButton: React.FC<RewriteButtonProps> = ({
  onPress,
  isLoading,
  disabled,
  disabledReason,
}) => {
  const isInactive = disabled || isLoading;

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isInactive && styles.buttonDisabled]}
        onPress={onPress}
        disabled={isInactive}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isLoading ? 'Rewriting, please wait' : 'Rewrite with AI'}
        accessibilityState={{ disabled: isInactive, busy: isLoading }}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
            <Text style={styles.label}>Rewriting…</Text>
          </>
        ) : (
          <Text style={styles.label}>✨ Rewrite with AI</Text>
        )}
      </TouchableOpacity>

      {disabled && !isLoading && disabledReason ? (
        <Text style={styles.disabledReason}>{disabledReason}</Text>
      ) : null}
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    marginBottom: 4,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for Android
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
  },
  spinner: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disabledReason: {
    textAlign: 'center',
    fontSize: 12,
    color: '#E53935',
    marginBottom: 12,
    marginHorizontal: 20,
  },
});
