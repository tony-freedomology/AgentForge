import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notifications';
import { storageService } from '../services/storage';
import { useAgentStore } from '../stores/agentStore';
import { usePrefsStore } from '../stores/prefsStore';

export function useNotifications() {
  const router = useRouter();
  const { notifications: notificationPrefs } = usePrefsStore();

  // Handle notification received while app is foregrounded
  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      // Notification was received while app is open
      // We might want to show an in-app toast instead of system notification
      console.log('Notification received:', notification.request.content);
    },
    []
  );

  // Handle notification response (user tapped notification)
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as {
        type?: string;
        agentId?: string;
        questId?: string;
      };

      // Navigate based on notification type
      switch (data.type) {
        case 'quest_complete':
          if (data.questId) {
            router.push(`/quest/${data.questId}`);
          }
          break;

        case 'agent_question':
        case 'agent_error':
        case 'agent_idle':
          if (data.agentId) {
            router.push(`/agent/${data.agentId}`);
          }
          break;

        case 'level_up':
          if (data.agentId) {
            router.push(`/agent/${data.agentId}/talents`);
          }
          break;

        case 'connection_lost':
        case 'connection_restored':
          router.push('/(tabs)/spire');
          break;

        default:
          router.push('/(tabs)/spire');
      }
    },
    [router]
  );

  // Initialize notifications
  useEffect(() => {
    const init = async () => {
      await notificationService.initialize();

      // Save push token
      const token = notificationService.getPushToken();
      if (token) {
        await storageService.setPushToken(token);
      }

      // Set up callbacks
      notificationService.setCallbacks({
        onReceived: handleNotificationReceived,
        onResponse: handleNotificationResponse,
      });
    };

    init();

    return () => {
      notificationService.cleanup();
    };
  }, [handleNotificationReceived, handleNotificationResponse]);

  // Update badge count based on unread items
  const updateBadgeCount = useCallback(async () => {
    const agentsNeedingAttention = useAgentStore
      .getState()
      .getAgentsNeedingAttention();

    await notificationService.setBadgeCount(agentsNeedingAttention.length);
  }, []);

  // Check if notifications are enabled for a type
  const isNotificationEnabled = useCallback(
    (type: 'questComplete' | 'needsInput' | 'errors' | 'levelUp' | 'agentIdle') => {
      if (!notificationPrefs.enabled) return false;

      switch (type) {
        case 'questComplete':
          return notificationPrefs.questComplete;
        case 'needsInput':
          return notificationPrefs.needsInput;
        case 'errors':
          return notificationPrefs.errors;
        case 'levelUp':
          return notificationPrefs.levelUp;
        case 'agentIdle':
          return notificationPrefs.agentIdle;
        default:
          return false;
      }
    },
    [notificationPrefs]
  );

  // Check if in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!notificationPrefs.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = notificationPrefs.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = notificationPrefs.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      // Simple case: quiet hours don't cross midnight
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours cross midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }, [notificationPrefs]);

  return {
    updateBadgeCount,
    isNotificationEnabled,
    isInQuietHours,
    getPushToken: () => notificationService.getPushToken(),
  };
}
