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
void SplashScreen.preventAutoHideAsync();

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
  const [isReady, setIsReady] = useState(__DEV__);

  // Initialize notifications
  useNotifications();

  // Check onboarding status
  const hasCompletedOnboarding = usePrefsStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    console.log('RootLayout mounted', {
      hasCompletedOnboarding,
      isReady,
      isDev: __DEV__,
    });
  }, [hasCompletedOnboarding, isReady]);

  useEffect(() => {
    let isMounted = true;
    let didTimeout = false;

    const timeoutId = setTimeout(() => {
      if (!isMounted) return;
      didTimeout = true;
      console.warn('Splash timeout exceeded, forcing app ready');
      setIsReady(true);
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Failed to hide splash after timeout:', error);
      });
    }, 4000);

    // Initialize services
    const initialize = async () => {
      try {
        // Initialize sound service
        await soundService.initialize();

        // Mark as ready
        if (!isMounted) return;
        setIsReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
        // Still show the app even if initialization fails
        if (!isMounted) return;
        setIsReady(true);
      } finally {
        if (!isMounted) return;
        if (!didTimeout) {
          clearTimeout(timeoutId);
        }
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Failed to hide splash during init:', error);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      soundService.cleanup();
    };
  }, []);

  // Don't render until ready (skip blocking in dev for easier testing)
  if (!isReady && !__DEV__) {
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
