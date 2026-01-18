import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { useConnectionStore, createConnection } from '../stores/connectionStore';
import { useSpireConnection } from '../hooks/useSpireConnection';
import { FantasyCard } from '../components/ui/FantasyCard';
import { FantasyButton } from '../components/ui/FantasyButton';
import { FantasyInput } from '../components/ui/FantasyInput';
import { LoadingRune } from '../components/ui/LoadingRune';
import { QRScanner } from '../components/QRScanner';
import { soundService } from '../services/sound';

type ConnectStep = 'choose' | 'manual' | 'scan' | 'connecting' | 'success';

export default function ConnectScreen() {
  const router = useRouter();

  const [step, setStep] = useState<ConnectStep>('choose');
  const [connectionUrl, setConnectionUrl] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [connectionCode, setConnectionCode] = useState('');

  const { connect, disconnect, connectionStatus } = useSpireConnection();
  const {
    savedConnections,
    currentConnection,
    removeConnection,
  } = useConnectionStore();

  const handleClose = () => {
    soundService.play('tap');
    router.back();
  };

  const handleManualConnect = () => {
    soundService.play('tap');
    setStep('manual');
  };

  const handleScanQR = () => {
    soundService.play('tap');
    // QR scanning would be implemented here
    setStep('scan');
  };

  const handleConnect = async () => {
    if (!connectionUrl.trim()) return;

    soundService.play('tap');
    setStep('connecting');

    const name = connectionName.trim() || 'My Forge';
    connect(connectionUrl.trim(), name);

    // Wait for connection
    setTimeout(() => {
      if (connectionStatus === 'connected') {
        setStep('success');
        setTimeout(() => router.back(), 1500);
      } else {
        setStep('manual');
      }
    }, 3000);
  };

  const handleSavedConnectionPress = (id: string) => {
    soundService.play('tap');
    const conn = savedConnections.find((c) => c.id === id);
    if (conn) {
      setStep('connecting');
      connect(conn.url, conn.name);

      setTimeout(() => {
        if (connectionStatus === 'connected') {
          setStep('success');
          setTimeout(() => router.back(), 1500);
        } else {
          setStep('choose');
        }
      }, 3000);
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

  // Choose screen (main)
  if (step === 'choose') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>═══ CONNECT YOUR FORGE ═══</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Current connection (if any) */}
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

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>
              To command your agents remotely, you need the AgentForge daemon running on your dev machine.
            </Text>

            <FantasyCard variant="dark" style={styles.commandCard}>
              <Text style={styles.commandLabel}>On your computer, run:</Text>
              <View style={styles.commandBox}>
                <Text style={styles.commandText}>npx agentforge daemon</Text>
                <Pressable
                  onPress={() => {
                    soundService.play('tap');
                    // Copy to clipboard would go here
                  }}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={18} color={Colors.arcane.purple} />
                </Pressable>
              </View>
            </FantasyCard>
          </View>

          {/* Connection options */}
          <View style={styles.options}>
            <FantasyButton
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleManualConnect}
              icon={<Ionicons name="link" size={20} color={Colors.shadow.black} />}
            >
              Enter Connection URL
            </FantasyButton>

            <FantasyButton
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleScanQR}
              icon={<Ionicons name="qr-code" size={20} color={Colors.text} />}
              style={styles.optionButton}
            >
              Scan QR Code
            </FantasyButton>
          </View>

          {/* Saved connections */}
          {savedConnections.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>Saved Connections</Text>
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

  // Manual entry screen
  if (step === 'manual') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => setStep('choose')} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.title}>═══ MANUAL CONNECTION ═══</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.manualContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Connection Name</Text>
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
                placeholder="ws://localhost:3001"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHint}>
                The daemon will show this URL when it starts
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <FantasyButton
              variant="summon"
              size="lg"
              fullWidth
              onPress={handleConnect}
              disabled={!connectionUrl.trim()}
            >
              Connect
            </FantasyButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Handle QR scan result
  const handleQRScan = (data: string) => {
    soundService.play('spawn');

    // Parse the scanned data
    let url = data;
    let name = 'Scanned Forge';

    // If it's a connection code format (spire-xxxx-yyyy-zzzz)
    if (data.startsWith('spire-')) {
      // Connection codes would need to be resolved via a lookup service
      // For now, we'll show an error
      setConnectionCode(data);
      setStep('choose');
      return;
    }

    // Set the URL and proceed to connect
    setConnectionUrl(url);
    setConnectionName(name);
    setStep('connecting');
    connect(url, name);

    setTimeout(() => {
      if (connectionStatus === 'connected') {
        setStep('success');
        setTimeout(() => router.back(), 1500);
      } else {
        setStep('manual');
      }
    }, 3000);
  };

  // QR Scan screen
  if (step === 'scan') {
    return (
      <QRScanner
        onScan={handleQRScan}
        onClose={() => setStep('choose')}
        instructionText="Point your camera at the QR code shown in your terminal"
        showTorch
      />
    );
  }

  // Connecting screen
  if (step === 'connecting') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <LoadingRune size="lg" label="Connecting to your Forge..." />
      </SafeAreaView>
    );
  }

  // Success screen
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
  instructions: {
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.5,
    marginBottom: Spacing.md,
  },
  commandCard: {
    padding: Spacing.md,
  },
  commandLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
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
    fontFamily: 'monospace',
    fontSize: FontSize.md,
    color: Colors.arcane.purple,
  },
  copyButton: {
    padding: Spacing.sm,
  },
  options: {
    marginBottom: Spacing.lg,
  },
  optionButton: {
    marginTop: Spacing.md,
  },
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

  // Scan
  scanContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  scanPlaceholder: {
    flex: 1,
    backgroundColor: Colors.shadow.darker,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  scanSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  codeSection: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  codeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  codeButton: {
    marginTop: Spacing.md,
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
