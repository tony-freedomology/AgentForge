import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface ScryingPoolProps {
  outputBuffer: string[];
  maxLines?: number;
}

export function ScryingPool({ outputBuffer, maxLines = 500 }: ScryingPoolProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [outputBuffer.length]);

  const lines = outputBuffer.slice(-maxLines);

  if (lines.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>The scrying pool is still...</Text>
        <Text style={styles.emptySubtext}>Agent output will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >
      {lines.map((line, index) => (
        <OutputLine key={`${index}-${line.substring(0, 20)}`} content={line} />
      ))}
    </ScrollView>
  );
}

// Individual output line with syntax highlighting
interface OutputLineProps {
  content: string;
}

function OutputLine({ content }: OutputLineProps) {
  // Simple syntax highlighting
  const getLineStyle = () => {
    if (content.startsWith('>') || content.startsWith('$')) {
      return styles.command;
    }
    if (content.includes('error') || content.includes('Error') || content.includes('ERROR')) {
      return styles.error;
    }
    if (content.includes('warning') || content.includes('Warning') || content.includes('WARN')) {
      return styles.warning;
    }
    if (content.includes('✓') || content.includes('success') || content.includes('passed')) {
      return styles.success;
    }
    if (content.startsWith('//') || content.startsWith('#')) {
      return styles.comment;
    }
    return styles.default;
  };

  return (
    <Text style={[styles.line, getLineStyle()]} selectable>
      {content}
    </Text>
  );
}

// Compact version for inline preview
interface ScryingPoolPreviewProps {
  outputBuffer: string[];
  maxLines?: number;
}

export function ScryingPoolPreview({ outputBuffer, maxLines = 5 }: ScryingPoolPreviewProps) {
  const lines = outputBuffer.slice(-maxLines);

  if (lines.length === 0) {
    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewEmpty}>No output yet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      {lines.map((line, index) => (
        <Text
          key={`${index}-${line.substring(0, 20)}`}
          style={styles.previewLine}
          numberOfLines={1}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.shadow.darker,
  },
  content: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  line: {
    fontFamily: 'monospace',
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: 2,
  },
  default: {
    color: Colors.text,
  },
  command: {
    color: Colors.arcane.purple,
    fontWeight: '600',
  },
  error: {
    color: Colors.fire.orange,
  },
  warning: {
    color: Colors.holy.gold,
  },
  success: {
    color: Colors.fel.green,
  },
  comment: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Preview styles
  previewContainer: {
    backgroundColor: Colors.shadow.darker,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  previewEmpty: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  previewLine: {
    fontFamily: 'monospace',
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: FontSize.xs * 1.4,
  },
});
