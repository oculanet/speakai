/**
 * ToneSelector.tsx
 *
 * Renders four tone selection buttons arranged in a 2×2 grid.
 * The active tone is visually highlighted.  Selecting a tone also persists the
 * preference via the callback so the parent can call storageService.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TONE_OPTIONS } from '../utils/constants';
import type { ToneType } from '../utils/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ToneSelectorProps {
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
  /** When true the buttons are non-interactive (rewrite in progress). */
  disabled?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onToneChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tone</Text>
      <View style={styles.grid}>
        {TONE_OPTIONS.map((tone) => {
          const isActive = selectedTone === tone.key;
          return (
            <TouchableOpacity
              key={tone.key}
              style={[
                styles.toneButton,
                isActive && styles.toneButtonActive,
                disabled && styles.toneButtonDisabled,
              ]}
              onPress={() => !disabled && onToneChange(tone.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tone.label} tone: ${tone.description}`}
            >
              <Text style={styles.toneEmoji}>{tone.emoji}</Text>
              <Text
                style={[styles.toneLabel, isActive && styles.toneLabelActive]}
                numberOfLines={1}
              >
                {tone.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneButton: {
    // Each button takes ~50% width minus gap.
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
  },
  toneButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#EEF0FF',
  },
  toneButtonDisabled: {
    opacity: 0.5,
  },
  toneEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  toneLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    flexShrink: 1,
  },
  toneLabelActive: {
    color: '#6C63FF',
    fontWeight: '700',
  },
});
