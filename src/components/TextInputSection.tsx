/**
 * TextInputSection.tsx
 *
 * Multi-line text input with a character counter and a microphone button.
 *
 * The microphone button:
 *  - Shows a pulsing red indicator while recording.
 *  - Calls onStartListening / onStopListening when tapped.
 *  - Is disabled while an AI rewrite is in progress.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MAX_INPUT_CHARS } from '../utils/constants';

// ─── Props ───────────────────────────────────────────────────────────────────

interface TextInputSectionProps {
  value: string;
  onChangeText: (text: string) => void;
  isListening: boolean;
  isTranscribing: boolean;
  isRewriting: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TextInputSection: React.FC<TextInputSectionProps> = ({
  value,
  onChangeText,
  isListening,
  isTranscribing,
  isRewriting,
  onStartListening,
  onStopListening,
}) => {
  const charCount = value.length;
  const isAtLimit = charCount >= MAX_INPUT_CHARS;
  const micDisabled = isRewriting;

  const handleMicPress = () => {
    if (micDisabled) return;
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your message</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Type or speak your message…"
          placeholderTextColor="#A0A0A0"
          multiline
          maxLength={MAX_INPUT_CHARS}
          textAlignVertical="top"
          editable={!isRewriting}
          accessibilityLabel="Message input"
          accessibilityHint="Type the message you want to rewrite"
        />

        {/* Microphone / transcribing indicator */}
        <TouchableOpacity
          style={[
            styles.micButton,
            micDisabled && styles.micButtonDisabled,
          ]}
          onPress={handleMicPress}
          disabled={micDisabled}
          accessibilityLabel={isListening ? 'Stop recording' : 'Start voice input'}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.micButtonInner,
              isListening && styles.micButtonInnerActive,
            ]}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isListening ? 'stop' : 'mic'}
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Character counter */}
      <Text
        style={[styles.charCount, isAtLimit && styles.charCountLimit]}
        accessibilityLabel={`${charCount} of ${MAX_INPUT_CHARS} characters used`}
      >
        {charCount}/{MAX_INPUT_CHARS}
      </Text>

      {isListening && (
        <Text style={styles.listeningHint}>🎙 Listening… tap the button to stop.</Text>
      )}
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
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minHeight: 110,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
  },
  micButton: {
    width: 44,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    paddingRight: 8,
    backgroundColor: 'transparent',
  },
  micButtonInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonInnerActive: {
    backgroundColor: '#E53935',
  },
  micButtonActive: {
    // Active state handled by micButtonInnerActive
  },
  micButtonDisabled: {
    opacity: 0.4,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: '#AAA',
    marginTop: 4,
  },
  charCountLimit: {
    color: '#E53935',
  },
  listeningHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#E53935',
    textAlign: 'center',
  },
});
