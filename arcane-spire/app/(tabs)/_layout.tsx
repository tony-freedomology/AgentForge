import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Image, ImageSourcePropType } from 'react-native';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Icons } from '../../constants/assets';
import { useAgentStore } from '../../stores/agentStore';
import { useQuestStore } from '../../stores/questStore';
import { useChronicleStore } from '../../stores/chronicleStore';
import { CountBadge } from '../../components/ui/StatusBadge';
import { soundService } from '../../services/sound';

export default function TabLayout() {
  // Get badge counts
  const agentsNeedingAttention = useAgentStore((state) => state.getAgentsNeedingAttention().length);
  const pendingQuests = useQuestStore((state) => state.getPendingReviewQuests().length);
  const unreadChronicle = useChronicleStore((state) => state.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.arcane.purple,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
      screenListeners={{
        tabPress: () => {
          soundService.playSound('ui', 'navTab');
        },
      }}
    >
      <Tabs.Screen
        name="spire"
        options={{
          title: 'Spire',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              source={focused ? Icons.tabs.spireActive : Icons.tabs.spire}
              size={size}
              badge={agentsNeedingAttention}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Chronicle',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              source={focused ? Icons.tabs.chronicleActive : Icons.tabs.chronicle}
              size={size}
              badge={unreadChronicle}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              source={focused ? Icons.tabs.questsActive : Icons.tabs.quests}
              size={size}
              badge={pendingQuests}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          title: 'Grimoire',
          tabBarIcon: ({ size, focused }) => (
            <TabIcon
              source={focused ? Icons.tabs.grimoireActive : Icons.tabs.grimoire}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Tab icon with optional badge
interface TabIconProps {
  source: ImageSourcePropType;
  size: number;
  badge?: number;
}

function TabIcon({ source, size, badge }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {badge !== undefined && badge > 0 && (
        <CountBadge count={badge} style={styles.badge} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.shadow.darker,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 60,
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.xs,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  tabItem: {
    paddingVertical: Spacing.xs,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
});
