import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Agent } from '../shared/types/agent';
import { Quest } from '../shared/types/quest';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types
export type NotificationType =
  | 'quest_complete'
  | 'agent_question'
  | 'agent_error'
  | 'agent_idle'
  | 'level_up'
  | 'connection_lost'
  | 'connection_restored';

// Notification data
interface NotificationData {
  type: NotificationType;
  agentId?: string;
  questId?: string;
  [key: string]: unknown;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  // Callbacks
  private onNotificationReceived: ((notification: Notifications.Notification) => void) | null = null;
  private onNotificationResponse: ((response: Notifications.NotificationResponse) => void) | null = null;

  // Initialize notifications
  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permissions not granted');
      return;
    }

    // Get push token
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      this.expoPushToken = token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Arcane Spire',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });

      await Notifications.setNotificationChannelAsync('urgent', {
        name: 'Urgent',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF4444',
      });
    }

    // Set up listeners
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      this.onNotificationReceived?.(notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      this.onNotificationResponse?.(response);
    });
  }

  // Clean up listeners
  cleanup(): void {
    this.notificationListener?.remove();
    this.responseListener?.remove();
  }

  // Set callbacks
  setCallbacks(callbacks: {
    onReceived?: (notification: Notifications.Notification) => void;
    onResponse?: (response: Notifications.NotificationResponse) => void;
  }): void {
    this.onNotificationReceived = callbacks.onReceived ?? null;
    this.onNotificationResponse = callbacks.onResponse ?? null;
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Schedule local notification
  async scheduleNotification(
    title: string,
    body: string,
    data: NotificationData,
    options?: {
      delay?: number;
      urgent?: boolean;
    }
  ): Promise<string> {
    const trigger = options?.delay
      ? { seconds: options.delay }
      : null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        ...(Platform.OS === 'android' && {
          channelId: options?.urgent ? 'urgent' : 'default',
        }),
      },
      trigger,
    });
  }

  // Cancel notification
  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // Notification presets
  async notifyQuestComplete(agent: Agent, quest: Quest): Promise<string> {
    return this.scheduleNotification(
      `${agent.name} completed a quest!`,
      quest.title,
      {
        type: 'quest_complete',
        agentId: agent.id,
        questId: quest.id,
      }
    );
  }

  async notifyAgentQuestion(agent: Agent, question: string): Promise<string> {
    return this.scheduleNotification(
      `${agent.name} has a question`,
      question,
      {
        type: 'agent_question',
        agentId: agent.id,
      },
      { urgent: true }
    );
  }

  async notifyAgentError(agent: Agent, error: string): Promise<string> {
    return this.scheduleNotification(
      `${agent.name} encountered an error`,
      error,
      {
        type: 'agent_error',
        agentId: agent.id,
      },
      { urgent: true }
    );
  }

  async notifyAgentIdle(agent: Agent, idleMinutes: number): Promise<string> {
    return this.scheduleNotification(
      `${agent.name} is idle`,
      `Dormant for ${idleMinutes} minutes`,
      {
        type: 'agent_idle',
        agentId: agent.id,
      }
    );
  }

  async notifyLevelUp(agent: Agent, newLevel: number): Promise<string> {
    return this.scheduleNotification(
      `${agent.name} leveled up!`,
      `Now Level ${newLevel}`,
      {
        type: 'level_up',
        agentId: agent.id,
      }
    );
  }

  async notifyConnectionLost(): Promise<string> {
    return this.scheduleNotification(
      'Connection Lost',
      'Lost connection to your development machine',
      {
        type: 'connection_lost',
      },
      { urgent: true }
    );
  }

  async notifyConnectionRestored(): Promise<string> {
    return this.scheduleNotification(
      'Connection Restored',
      'Reconnected to your development machine',
      {
        type: 'connection_restored',
      }
    );
  }

  // Batch notifications
  async notifyMultipleAgentsNeedAttention(agents: Agent[]): Promise<string> {
    const count = agents.length;
    const types = new Set(agents.map((a) => a.status));

    let body = `${count} agents need your attention`;
    if (types.has('awaiting')) {
      body = `${count} agents have questions`;
    } else if (types.has('error')) {
      body = `${count} agents have errors`;
    }

    return this.scheduleNotification(
      'Agents Need Attention',
      body,
      {
        type: 'agent_question',
      },
      { urgent: true }
    );
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for testing
export { NotificationService };
