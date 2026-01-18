/**
 * Expo app configuration
 * Extends app.json with dynamic values
 */
export default ({ config }) => {
  return {
    ...config,
    name: 'Arcane Spire',
    slug: 'arcane-spire',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    scheme: 'arcane-spire',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0D0D12',
    },
    ios: {
      bundleIdentifier: 'com.agentforge.arcanespire',
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
    },
    android: {
      package: 'com.agentforge.arcanespire',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0D0D12',
      },
      permissions: ['RECEIVE_BOOT_COMPLETED', 'VIBRATE', 'CAMERA'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#9B5DE5',
          sounds: ['./assets/sounds/notification.wav'],
        },
      ],
      [
        'expo-av',
        {
          microphonePermission: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      // Environment-specific config
      apiUrl: process.env.API_URL || 'ws://localhost:3001',
      environment: process.env.NODE_ENV || 'development',

      // Feature flags
      enableAnalytics: process.env.NODE_ENV === 'production',
      enableCrashReporting: process.env.NODE_ENV === 'production',

      // Router config
      router: {
        origin: false,
      },

      // EAS config
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '',
      },
    },
  };
};
