import { Redirect } from 'expo-router';
import { usePrefsStore } from '../stores/prefsStore';

export default function Index() {
  const hasCompletedOnboarding = usePrefsStore((state) => state.hasCompletedOnboarding);
  return (
    <Redirect href={hasCompletedOnboarding ? '/(tabs)/spire' : '/onboarding'} />
  );
}
