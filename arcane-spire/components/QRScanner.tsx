import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { FantasyButton } from './ui/FantasyButton';
import { LoadingRune } from './ui/LoadingRune';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

interface QRScannerProps {
  /** Callback when a QR code is scanned */
  onScan: (data: string) => void;
  /** Callback to close the scanner */
  onClose: () => void;
  /** Instruction text */
  instructionText?: string;
  /** Whether to show the torch toggle */
  showTorch?: boolean;
}

/**
 * QRScanner - Scans QR codes for connection URLs
 *
 * Uses expo-camera to scan QR codes. Shows a fantasy-themed overlay
 * with a scan area indicator and animated scan line.
 */
export function QRScanner({
  onScan,
  onClose,
  instructionText = 'Point your camera at the QR code shown in your terminal',
  showTorch = true,
}: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // Animation for scan line
  const scanLinePosition = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Animate scan line
    scanLinePosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scanLinePosition.value * (SCAN_AREA_SIZE - 4) },
    ],
  }));

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    const { data } = result;

    // Validate that it looks like a WebSocket URL or connection code
    if (data.startsWith('ws://') || data.startsWith('wss://') || data.startsWith('spire-')) {
      onScan(data);
    } else {
      // Invalid QR code, allow rescanning
      setTimeout(() => setScanned(false), 1500);
    }
  };

  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  // Permission loading
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <LoadingRune size="lg" label="Requesting camera access..." />
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionDenied}>
          <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Enable camera access in your device settings to scan QR codes
          </Text>
          <FantasyButton
            variant="secondary"
            onPress={onClose}
            style={styles.closeButton}
          >
            Go Back
          </FantasyButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera view */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top section */}
        <View style={styles.overlaySection}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </Pressable>
        </View>

        {/* Middle section with scan area */}
        <View style={styles.middleSection}>
          <View style={styles.overlaySide} />

          {/* Scan area */}
          <View style={styles.scanArea}>
            {/* Corners */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line */}
            <Animated.View style={[styles.scanLine, scanLineStyle]} />
          </View>

          <View style={styles.overlaySide} />
        </View>

        {/* Bottom section */}
        <View style={styles.overlaySection}>
          <Text style={styles.instruction}>{instructionText}</Text>

          {/* Controls */}
          <View style={styles.controls}>
            {showTorch && (
              <Pressable
                onPress={toggleTorch}
                style={[styles.controlBtn, torch && styles.controlBtnActive]}
              >
                <Ionicons
                  name={torch ? 'flash' : 'flash-outline'}
                  size={24}
                  color={torch ? Colors.holy.gold : Colors.text}
                />
              </Pressable>
            )}
          </View>

          {/* Scanned indicator */}
          {scanned && (
            <View style={styles.scannedIndicator}>
              <LoadingRune size="sm" label="Processing..." />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * QRScannerButton - Button that opens the QR scanner
 */
interface QRScannerButtonProps {
  onPress: () => void;
  label?: string;
}

export function QRScannerButton({ onPress, label = 'Scan QR Code' }: QRScannerButtonProps) {
  return (
    <FantasyButton
      variant="secondary"
      size="lg"
      fullWidth
      onPress={onPress}
      icon={<Ionicons name="qr-code" size={20} color={Colors.text} />}
    >
      {label}
    </FantasyButton>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.shadow.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlaySection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  middleSection: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.arcane.purple,
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.md,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.md,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.md,
  },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: Colors.arcane.purple,
    shadowColor: Colors.arcane.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  instruction: {
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  controlBtnActive: {
    backgroundColor: Colors.holy.gold + '30',
    borderColor: Colors.holy.gold,
  },
  scannedIndicator: {
    marginTop: Spacing.lg,
  },
  permissionDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  permissionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: Spacing.xl,
  },
});

export default QRScanner;
