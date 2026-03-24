/**
 * ActionButtons.tsx
 *
 * Copy-to-clipboard and Android share-sheet buttons for a single rewritten
 * text variation.
 *
 * Both operations give immediate visual feedback via a brief "Copied!" label.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ActionButtonsProps {
  text: string;
  /** Optional label shown above the buttons (e.g. "Variation 1"). */
  label?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ActionButtons: React.FC<ActionButtonsProps> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  // ── Copy ──────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      // Reset the visual feedback after 2 seconds.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Error', 'Could not copy text to clipboard.');
    }
  }, [text]);

  // ── Share ─────────────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    try {
      // expo-sharing uses Android's native share sheet on Android.
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        // Fallback: copy to clipboard with a notification.
        await Clipboard.setStringAsync(text);
        Alert.alert('Copied', 'Sharing is not available on this device. Text has been copied to clipboard.');
        return;
      }

      // expo-sharing requires a file URI, so for plain text we fall back to
      // the React Native Share API which accepts a message directly.
      if (Platform.OS === 'android') {
        await Share.share({ message: text });
      } else {
        // iOS / other: use expo-sharing with a temporary file.
        await Clipboard.setStringAsync(text);
        Alert.alert('Copied', 'Text copied to clipboard. Paste it wherever you like!');
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'User did not share') {
        Alert.alert('Error', 'Could not share the text.');
      }
    }
  }, [text]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.variationLabel}>{label}</Text> : null}

      <View style={styles.buttonRow}>
        {/* Copy button */}
        <TouchableOpacity
          style={[styles.button, styles.copyButton]}
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied!' : `Copy ${label ?? 'text'} to clipboard`}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={16}
            color={copied ? '#4CAF50' : '#6C63FF'}
          />
          <Text style={[styles.buttonLabel, copied && styles.buttonLabelCopied]}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel={`Share ${label ?? 'text'}`}
        >
          <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
          <Text style={[styles.buttonLabel, styles.shareLabel]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  variationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  copyButton: {
    backgroundColor: '#EEF0FF',
    borderWidth: 1,
    borderColor: '#C5C2FF',
  },
  shareButton: {
    backgroundColor: '#6C63FF',
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  buttonLabelCopied: {
    color: '#4CAF50',
  },
  shareLabel: {
    color: '#FFFFFF',
  },
});
