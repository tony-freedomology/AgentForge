import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Clipboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useConnectionStore } from '../stores/connectionStore';
import { useSpireConnection } from '../hooks/useSpireConnection';
import { FantasyCard } from '../components/ui/FantasyCard';
import { FantasyButton } from '../components/ui/FantasyButton';
import { FantasyInput } from '../components/ui/FantasyInput';
import { LoadingRune } from '../components/ui/LoadingRune';
import { QRScanner } from '../components/QRScanner';
import { soundService } from '../services/sound';

type ConnectStep = 'choose' | 'tailscale' | 'manual' | 'scan' | 'connecting' | 'success' | 'error';

export default function ConnectScreen() {
  const router = useRouter();

  const [step, setStep] = useState<ConnectStep>('choose');
  const [connectionUrl, setConnectionUrl] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [tailscaleHostname, setTailscaleHostname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { connect, disconnect, connectionStatus } = useSpireConnection();
  const {
    savedConnections,
    currentConnection,
    removeConnection,
  } = useConnectionStore();

  // Watch for connection status changes
  useEffect(() => {
    if (step === 'connecting') {
      if (connectionStatus === 'connected') {
        soundService.play('spawn');
        setStep('success');
        setTimeout(() => router.back(), 1500);
      } else if (connectionStatus === 'error') {
        setStep('error');
      }
    }
  }, [connectionStatus, step, router]);

  const handleClose = () => {
    soundService.play('tap');
    router.back();
  };

  const handleTailscaleConnect = () => {
    soundService.play('tap');
    setStep('tailscale');
  };

  const handleManualConnect = () => {
    soundService.play('tap');
    setStep('manual');
  };

  const handleScanQR = () => {
    soundService.play('tap');
    setStep('scan');
  };

  const handleCopyCommand = async () => {
    soundService.play('tap');
    try {
      await Clipboard.setString('npx @agentforge/daemon');
      Alert.alert('Copied!', 'Command copied to clipboard');
    } catch {
      // Clipboard API may not be available
    }
  };

  // Connect via Tailscale hostname
  const handleTailscaleSubmit = () => {
    if (!tailscaleHostname.trim()) return;

    soundService.play('tap');
    setStep('connecting');
    setErrorMessage('');

    // Build the WebSocket URL from Tailscale hostname
    const hostname = tailscaleHostname.trim().toLowerCase();
    const url = `ws://${hostname}:3001`;
    const name = `${hostname} (Tailscale)`;

    setConnectionUrl(url);
    setConnectionName(name);
    connect(url, name);
  };

  // Connect via manual URL
  const handleManualSubmit = () => {
    if (!connectionUrl.trim()) return;

    soundService.play('tap');
    setStep('connecting');
    setErrorMessage('');

    const name = connectionName.trim() || 'My Forge';
    connect(connectionUrl.trim(), name);
  };

  const handleSavedConnectionPress = (id: string) => {
    soundService.play('tap');
    const conn = savedConnections.find((c) => c.id === id);
    if (conn) {
      setStep('connecting');
      setErrorMessage('');
      connect(conn.url, conn.name);
    }
  };

  const handleDeleteConnection = (id: string) => {
    soundService.play('tap');
    removeConnection(id);
  };

  const handleDisconnect = () => {
    soundService.play('tap');
    disconnect();
  };

  const handleRetry = () => {
    soundService.play('tap');
    setStep('choose');
    setErrorMessage('');
  };

  // Handle QR scan result
  const handleQRScan = (data: string) => {
    soundService.play('spawn');

    let url = data;
    let name = 'Scanned Forge';

    // If it's a Tailscale URL pattern
    if (data.includes('.ts.net') || data.match(/^[a-z0-9-]+$/i)) {
      // It's likely a Tailscale hostname
      url = data.startsWith('ws://') ? data : `ws://${data}:3001`;
      name = 'Tailscale Forge';
    }

    setConnectionUrl(url);
    setConnectionName(name);
    setStep('connecting');
    connect(url, name);
  };

  // ===== CHOOSE SCREEN =====
  if (step === 'choose') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>═══ CONNECT YOUR FORGE ═══</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Current connection */}
          {currentConnection && connectionStatus === 'connected' && (
            <FantasyCard variant="gold" style={styles.currentCard}>
              <View style={styles.currentHeader}>
                <View style={styles.currentIndicator} />
                <Text style={styles.currentLabel}>Connected</Text>
              </View>
              <Text style={styles.currentName}>{currentConnection.name}</Text>
              <Text style={styles.currentUrl}>{currentConnection.url}</Text>
              <FantasyButton
                variant="secondary"
                size="sm"
                onPress={handleDisconnect}
                style={styles.disconnectButton}
              >
                Disconnect
              </FantasyButton>
            </FantasyCard>
          )}

          {/* Quick Setup for Tailscale Users */}
          <FantasyCard variant="stone" style={styles.tailscaleCard}>
            <View style={styles.tailscaleHeader}>
              <Text style={styles.tailscaleIcon}>🔐</Text>
              <View style={styles.tailscaleInfo}>
                <Text style={styles.tailscaleTitle}>Using Tailscale?</Text>
                <Text style={styles.tailscaleSubtitle}>Fastest way to connect securely</Text>
              </View>
            </View>
            <FantasyButton
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleTailscaleConnect}
              icon={<Ionicons name="flash" size={20} color={Colors.shadow.black} />}
            >
              Quick Connect via Tailscale
            </FantasyButton>
          </FantasyCard>

          {/* Daemon Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>
              First, start the daemon on your dev machine:
            </Text>

            <FantasyCard variant="dark" style={styles.commandCard}>
              <View style={styles.commandBox}>
                <Text style={styles.commandText}>npx @agentforge/daemon</Text>
                <Pressable onPress={handleCopyCommand} style={styles.copyButton}>
                  <Ionicons name="copy-outline" size={18} color={Colors.arcane.purple} />
                </Pressable>
              </View>
            </FantasyCard>
          </View>

          {/* Other Connection Options */}
          <View style={styles.options}>
            <FantasyButton
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleManualConnect}
              icon={<Ionicons name="link" size={18} color={Colors.text} />}
            >
              Enter URL Manually
            </FantasyButton>

            <FantasyButton
              variant="secondary"
              size="md"
              fullWidth
              onPress={handleScanQR}
              icon={<Ionicons name="qr-code" size={18} color={Colors.text} />}
              style={styles.optionButton}
            >
              Scan QR Code
            </FantasyButton>
          </View>

          {/* Saved connections */}
          {savedConnections.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>Recent Connections</Text>
              {savedConnections.map((conn) => (
                <FantasyCard
                  key={conn.id}
                  variant="stone"
                  onPress={() => handleSavedConnectionPress(conn.id)}
                  style={styles.savedCard}
                >
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedName}>{conn.name}</Text>
                    <Text style={styles.savedUrl}>{conn.url}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteConnection(conn.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.fire.orange} />
                  </Pressable>
                </FantasyCard>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== TAILSCALE QUICK CONNECT =====
  if (step === 'tailscale') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <Pressable onPress={() => setStep('choose')} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.title}>═══ TAILSCALE CONNECT ═══</Text>
            <View style={styles.closeButton} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.tailscaleContent}>
            {/* Steps */}
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Find your computer's Tailscale name</Text>
                  <Text style={styles.stepDesc}>
                    Open Tailscale on your Mac/PC and note the machine name
                    {'\n'}(e.g., "macbook-pro" or "desktop-pc")
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Make sure daemon is running</Text>
                  <View style={styles.miniCommandBox}>
                    <Text style={styles.miniCommandText}>npx @agentforge/daemon</Text>
                  </View>
                </View>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, styles.stepNumberActive]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Enter your Tailscale hostname</Text>
                  <FantasyInput
                    value={tailscaleHostname}
                    onChangeText={setTailscaleHostname}
                    placeholder="macbook-pro"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmit={handleTailscaleSubmit}
                  />
                  <Text style={styles.inputHint}>
                    Just the hostname — we'll add the port automatically
                  </Text>
                </View>
              </View>
            </View>

            {/* Preview */}
            {tailscaleHostname.trim() && (
              <FantasyCard variant="dark" style={styles.previewCard}>
                <Text style={styles.previewLabel}>Will connect to:</Text>
                <Text style={styles.previewUrl}>
                  ws://{tailscaleHostname.trim().toLowerCase()}:3001
                </Text>
              </FantasyCard>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <FantasyButton
              variant="summon"
              size="lg"
              fullWidth
              onPress={handleTailscaleSubmit}
              disabled={!tailscaleHostname.trim()}
            >
              Connect via Tailscale
            </FantasyButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ===== MANUAL ENTRY =====
  if (step === 'manual') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <Pressable onPress={() => setStep('choose')} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.title}>═══ MANUAL CONNECTION ═══</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.manualContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Connection Name (optional)</Text>
              <FantasyInput
                value={connectionName}
                onChangeText={setConnectionName}
                placeholder="My MacBook"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>WebSocket URL</Text>
              <FantasyInput
                value={connectionUrl}
                onChangeText={setConnectionUrl}
                placeholder="ws://192.168.1.100:3001"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmit={handleManualSubmit}
              />
              <Text style={styles.inputHint}>
                The daemon shows this URL when it starts
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <FantasyButton
              variant="summon"
              size="lg"
              fullWidth
              onPress={handleManualSubmit}
              disabled={!connectionUrl.trim()}
            >
              Connect
            </FantasyButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ===== QR SCAN =====
  if (step === 'scan') {
    return (
      <QRScanner
        onScan={handleQRScan}
        onClose={() => setStep('choose')}
        instructionText="Point at the QR code shown by the daemon"
        showTorch
      />
    );
  }

  // ===== CONNECTING =====
  if (step === 'connecting') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <LoadingRune size="lg" label="Establishing arcane link..." />
        <Text style={styles.connectingUrl}>{connectionUrl}</Text>
      </SafeAreaView>
    );
  }

  // ===== ERROR =====
  if (step === 'error') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>🔮 ❌</Text>
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>
            Could not reach the daemon at:
          </Text>
          <Text style={styles.errorUrl}>{connectionUrl}</Text>
          <Text style={styles.errorHint}>
            Make sure the daemon is running and{'\n'}
            both devices are on the same network or Tailscale
          </Text>
          <FantasyButton
            variant="secondary"
            onPress={handleRetry}
            style={styles.retryButton}
          >
            Try Again
          </FantasyButton>
        </View>
      </SafeAreaView>
    );
  }

  // ===== SUCCESS =====
  return (
    <SafeAreaView style={styles.centerContainer}>
      <View style={styles.successContent}>
        <Text style={styles.successIcon}>🏰 ✨ 🏰</Text>
        <Text style={styles.successTitle}>YOUR SPIRE IS CONNECTED!</Text>
        <Text style={styles.successText}>
          {currentConnection?.name || 'Your Forge'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },

  // Current connection
  currentCard: {
    marginBottom: Spacing.lg,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.fel.green,
    marginRight: Spacing.sm,
  },
  currentLabel: {
    fontSize: FontSize.sm,
    color: Colors.shadow.black,
    fontWeight: '600',
  },
  currentName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.shadow.black,
  },
  currentUrl: {
    fontSize: FontSize.sm,
    color: Colors.shadow.lighter,
    marginTop: 2,
  },
  disconnectButton: {
    marginTop: Spacing.md,
  },

  // Tailscale card
  tailscaleCard: {
    marginBottom: Spacing.lg,
  },
  tailscaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tailscaleIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  tailscaleInfo: {
    flex: 1,
  },
  tailscaleTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  tailscaleSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Instructions
  instructions: {
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  commandCard: {
    padding: Spacing.md,
  },
  commandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.black,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  commandText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.md,
    color: Colors.arcane.purple,
  },
  copyButton: {
    padding: Spacing.sm,
  },

  // Options
  options: {
    marginBottom: Spacing.lg,
  },
  optionButton: {
    marginTop: Spacing.sm,
  },

  // Saved
  savedSection: {
    marginTop: Spacing.md,
  },
  savedTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  savedInfo: {
    flex: 1,
  },
  savedName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  savedUrl: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },

  // Tailscale step-by-step
  tailscaleContent: {
    padding: Spacing.md,
  },
  stepsContainer: {
    marginBottom: Spacing.lg,
  },
  step: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stepNumberActive: {
    backgroundColor: Colors.arcane.purple,
  },
  stepNumberText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.5,
  },
  miniCommandBox: {
    backgroundColor: Colors.shadow.black,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  miniCommandText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.sm,
    color: Colors.arcane.purple,
  },
  previewCard: {
    padding: Spacing.md,
  },
  previewLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  previewUrl: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.md,
    color: Colors.fel.green,
  },

  // Manual entry
  manualContent: {
    flex: 1,
    padding: Spacing.md,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // Connecting
  connectingUrl: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Error
  errorContent: {
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.fire.orange,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  errorUrl: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.sm,
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: FontSize.sm * 1.5,
  },
  retryButton: {
    marginTop: Spacing.xl,
  },

  // Success
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  successText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
