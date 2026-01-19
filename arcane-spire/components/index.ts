// Main components index - re-exports all components

// UI Components
export * from './ui';

// Spire Components
export * from './spire';

// Party Dock
export * from './party-dock';

// Chamber Components
export * from './chamber';

// Agent Components
export * from './agent';

// Error Boundary
export { ErrorBoundary, ScreenErrorBoundary, MinimalErrorFallback } from './ErrorBoundary';
export { withErrorBoundary } from './withErrorBoundary';

// Offline Banner
export {
  OfflineBanner,
  ConnectionStatusBanner,
  OfflineWrapper,
} from './OfflineBanner';
export { useNetworkStatus } from '../hooks/useNetworkStatus';

// Connection Status
export { ConnectionStatusBar, ConnectionStatusIndicator } from './ConnectionStatusBar';

// QR Scanner
export { QRScanner, QRScannerButton } from './QRScanner';

// Level Up Celebration
export { LevelUpCelebration } from './LevelUpCelebration';
export { useLevelUpCelebration } from '../hooks/useLevelUpCelebration';
