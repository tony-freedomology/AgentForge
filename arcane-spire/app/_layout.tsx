import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';
import { useNotifications } from '../hooks/useNotifications';
import { usePrefsStore } from '../stores/prefsStore';
import { soundService } from '../services/sound';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineBanner, ConnectionStatusBanner } from '../components/OfflineBanner';
import '../global.css';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Root layout for the Arcane Spire app
 *
 * Handles:
 * - Error boundaries for crash recovery
 * - Network/connection status banners
 * - Onboarding flow for first-time users
 * - Service initialization
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  // Initialize notifications
  useNotifications();

  // Check onboarding status
  const hasCompletedOnboarding = usePrefsStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    // Initialize services
    const initialize = async () => {
      try {
        // Initialize sound service
        await soundService.initialize();

        // Mark as ready
        setIsReady(true);

        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Initialization error:', error);
        // Still show the app even if initialization fails
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initialize();

    return () => {
      soundService.cleanup();
    };
  }, []);

  // Don't render until ready
  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
          <StatusBar style="light" />

          {/* Connection status banners */}
          <View style={{ backgroundColor: Colors.background }}>
            <OfflineBanner variant="compact" />
            <ConnectionStatusBanner />
          </View>

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'fade',
            }}
          >
            {/* Onboarding screen - shown only if not completed */}
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: false,
              }}
              redirect={hasCompletedOnboarding}
            />

            {/* Main tab navigation */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Modal screens */}
            <Stack.Screen
              name="summon"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="connect"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="agent/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="quest/[id]"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
