import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Image, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { Icons, Branding } from '../../constants/assets';
import { usePrefsStore } from '../../stores/prefsStore';
import { useConnectionStore } from '../../stores/connectionStore';
import { FantasyCard } from '../../components/ui/FantasyCard';
import { FantasyButton } from '../../components/ui/FantasyButton';
import { ConnectionStatusIndicator } from '../../components/ConnectionStatusBar';
import { soundService } from '../../services/sound';

// Map section icons to pixel art
const SECTION_ICONS: Record<string, ImageSourcePropType> = {
  link: Icons.action.settings, // Connection
  notifications: Icons.badges.alert,
  'volume-high': Icons.activity.idle, // Sound
  eye: Icons.activity.reading, // Display
  'information-circle': Icons.quest.scroll, // About
  bug: Icons.status.error, // Debug
};

export default function GrimoireScreen() {
  const router = useRouter();

  const {
    notifications,
    sound,
    display,
    setNotificationPrefs,
    setSoundPrefs,
    setDisplayPrefs,
    resetOnboarding,
  } = usePrefsStore();

  const { currentConnection, connectionStatus, savedConnections } = useConnectionStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>═══ GRIMOIRE ═══</Text>

        {/* Connection Section */}
        <SettingsSection title="Connection" icon="link">
          <Pressable
            onPress={() => {
              soundService.play('tap');
              router.push('/connect');
            }}
            style={styles.connectionCard}
          >
            <View style={styles.connectionInfo}>
              <ConnectionStatusIndicator />
              <View style={styles.connectionText}>
                <Text style={styles.connectionName}>
                  {currentConnection?.name || 'Not connected'}
                </Text>
                <Text style={styles.connectionStatus}>
                  {connectionStatus === 'connected'
                    ? 'Connected'
                    : connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Tap to connect'}
                </Text>
              </View>
            </View>
            <Image source={Icons.action.expand} style={styles.chevronIcon} resizeMode="contain" />
          </Pressable>

          {savedConnections.length > 1 && (
            <Text style={styles.savedCount}>
              {savedConnections.length} saved connections
            </Text>
          )}
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications" icon="notifications">
          <SettingsToggle
            label="Enable Notifications"
            value={notifications.enabled}
            onValueChange={(value) => setNotificationPrefs({ enabled: value })}
          />
          {notifications.enabled && (
            <>
              <SettingsToggle
                label="Quest Complete"
                description="When an agent finishes a quest"
                value={notifications.questComplete}
                onValueChange={(value) => setNotificationPrefs({ questComplete: value })}
              />
              <SettingsToggle
                label="Needs Input"
                description="When an agent has a question"
                value={notifications.needsInput}
                onValueChange={(value) => setNotificationPrefs({ needsInput: value })}
              />
              <SettingsToggle
                label="Errors"
                description="When an agent encounters an error"
                value={notifications.errors}
                onValueChange={(value) => setNotificationPrefs({ errors: value })}
              />
              <SettingsToggle
                label="Level Up"
                description="When an agent levels up"
                value={notifications.levelUp}
                onValueChange={(value) => setNotificationPrefs({ levelUp: value })}
              />
              <SettingsToggle
                label="Agent Idle"
                description="When an agent has been idle too long"
                value={notifications.agentIdle}
                onValueChange={(value) => setNotificationPrefs({ agentIdle: value })}
              />
            </>
          )}
        </SettingsSection>

        {/* Sound Section */}
        <SettingsSection title="Sound & Haptics" icon="volume-high">
          <SettingsToggle
            label="Sound Effects"
            value={sound.enabled}
            onValueChange={(value) => setSoundPrefs({ enabled: value })}
          />
          <SettingsToggle
            label="Haptic Feedback"
            value={sound.hapticEnabled}
            onValueChange={(value) => setSoundPrefs({ hapticEnabled: value })}
          />
        </SettingsSection>

        {/* Display Section */}
        <SettingsSection title="Display" icon="eye">
          <SettingsToggle
            label="Animations"
            description="Enable UI animations"
            value={display.animationsEnabled}
            onValueChange={(value) => setDisplayPrefs({ animationsEnabled: value })}
          />
          <SettingsToggle
            label="Show Party Dock"
            description="Quick access to agents at top of Spire"
            value={display.showPartyDock}
            onValueChange={(value) => setDisplayPrefs({ showPartyDock: value })}
          />
          <SettingsToggle
            label="Show Floor Names"
            description="Display floor labels on agent cards"
            value={display.showFloorNames}
            onValueChange={(value) => setDisplayPrefs({ showFloorNames: value })}
          />
          <SettingsToggle
            label="Compact Floor Cards"
            description="Use smaller agent cards"
            value={display.compactFloorCards}
            onValueChange={(value) => setDisplayPrefs({ compactFloorCards: value })}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About" icon="information-circle">
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>Dev</Text>
          </View>
        </SettingsSection>

        {/* Debug Section (dev only) */}
        <SettingsSection title="Debug" icon="bug">
          <FantasyButton
            variant="secondary"
            size="sm"
            onPress={() => {
              soundService.play('tap');
              resetOnboarding();
            }}
            style={styles.debugButton}
          >
            Reset Onboarding
          </FantasyButton>
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={Branding.logoIcon} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerText}>Arcane Spire</Text>
          <Text style={styles.footerSubtext}>Part of the AgentForge ecosystem</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Settings section component
interface SettingsSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  const iconSource = SECTION_ICONS[icon];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {iconSource ? (
          <Image source={iconSource} style={styles.sectionIcon} resizeMode="contain" />
        ) : (
          <Ionicons name={icon as any} size={20} color={Colors.arcane.purple} />
        )}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <FantasyCard variant="dark" style={styles.sectionContent}>
        {children}
      </FantasyCard>
    </View>
  );
}

// Settings toggle component
interface SettingsToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingsToggle({ label, description, value, onValueChange }: SettingsToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description && <Text style={styles.toggleDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          soundService.play('tap');
          onValueChange(newValue);
        }}
        trackColor={{ false: Colors.stone.dark, true: Colors.arcane.purple }}
        thumbColor={value ? Colors.arcane.purpleLight : Colors.stone.light}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.arcane.purple,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    padding: 0,
    overflow: 'hidden',
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  connectionText: {
    gap: 2,
  },
  connectionName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  connectionStatus: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chevronIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textMuted,
  },
  savedCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  aboutValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  debugButton: {
    margin: Spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerLogo: {
    width: 48,
    height: 48,
    marginBottom: Spacing.sm,
  },
  footerText: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
  footerSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
