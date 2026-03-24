/**
 * OutputArea.tsx
 *
 * Displays the original text and both AI-generated variations side by side
 * (stacked vertically).  Each variation card includes its own ActionButtons
 * (copy + share).
 *
 * Renders nothing when output is null.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TONE_DESCRIPTIONS } from '../utils/constants';
import type { RewriteOutput } from '../utils/types';
import { ActionButtons } from './ActionButtons';

// ─── Props ───────────────────────────────────────────────────────────────────

interface OutputAreaProps {
  output: RewriteOutput | null;
}

// ─── Sub-component: single variation card ────────────────────────────────────

interface VariationCardProps {
  title: string;
  text: string;
  accentColor: string;
}

const VariationCard: React.FC<VariationCardProps> = ({ title, text, accentColor }) => (
  <View style={[styles.card, { borderLeftColor: accentColor }]}>
    <ActionButtons text={text} label={title} />
    <Text style={styles.variationText} selectable>
      {text}
    </Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const OutputArea: React.FC<OutputAreaProps> = ({ output }) => {
  if (!output) return null;

  const toneMeta = TONE_DESCRIPTIONS[output.variation1.tone];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {toneMeta.emoji} {toneMeta.label} Rewrites
        </Text>
        <Text style={styles.sectionTimestamp}>
          {new Date(output.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <VariationCard
        title="Variation 1"
        text={output.variation1.text}
        accentColor="#6C63FF"
      />

      <VariationCard
        title="Variation 2"
        text={output.variation2.text}
        accentColor="#FF6584"
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  sectionTimestamp: {
    fontSize: 11,
    color: '#AAA',
  },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
  },
  variationText: {
    marginTop: 12,
    fontSize: 15,
    color: '#222',
    lineHeight: 23,
  },
});
