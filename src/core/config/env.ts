import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 5001;

// Order: explicit env var -> host of the Expo dev server (works on real devices) -> emulator loopback.
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) return `http://${devHost}:${API_PORT}/api`;

  const loopback = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${loopback}:${API_PORT}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

// Origin of the API server (without /api); used to open signed document links returned as relative paths.
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
