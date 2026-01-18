import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { soundService } from '../../services/sound';

interface FantasyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  onSubmit?: () => void;
  showSendButton?: boolean;
  sendButtonDisabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  label?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function FantasyInput({
  value,
  onChangeText,
  placeholder = 'Enter text...',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  onSubmit,
  showSendButton = false,
  sendButtonDisabled = false,
  style,
  inputStyle,
  label,
}: FantasyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    borderOpacity.value = withSpring(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderOpacity.value = withSpring(0);
  };

  const handleSubmit = () => {
    if (onSubmit && value.trim()) {
      soundService.play('tap');
      onSubmit();
    }
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: isFocused ? Colors.arcane.purple : Colors.border,
    shadowColor: Colors.arcane.purple,
    shadowOpacity: borderOpacity.value * 0.3,
    shadowRadius: 5,
  }));

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <AnimatedView style={[styles.container, animatedBorderStyle]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType={onSubmit ? 'send' : 'default'}
          style={[
            styles.input,
            multiline && { height: numberOfLines * 24 + Spacing.md * 2 },
            inputStyle,
          ]}
        />
        {showSendButton && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={sendButtonDisabled || !value.trim()}
            style={[
              styles.sendButton,
              (sendButtonDisabled || !value.trim()) && styles.sendButtonDisabled,
            ]}
          >
            <Ionicons
              name="send"
              size={20}
              color={sendButtonDisabled || !value.trim() ? Colors.textMuted : Colors.arcane.purple}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.darker,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    paddingVertical: Spacing.md,
  },
  sendButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
