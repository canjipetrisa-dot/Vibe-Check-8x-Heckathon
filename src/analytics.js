import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

const key = Constants.expoConfig?.extra?.POSTHOG_KEY;

export const posthog = key
  ? new PostHog(key, { host: 'https://us.i.posthog.com' })
  : null;

export function track(event, properties = {}) {
  try {
    posthog?.capture(event, properties);
  } catch (e) {
    // analytics must never break the app
  }
}
