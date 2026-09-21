import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthTokens } from '@/domain/entities';

const ACCESS_KEY = 'cadovet.accessToken';
const REFRESH_KEY = 'cadovet.refreshToken';

// SecureStore (Keychain / Keystore) is native-only; the web build falls back to AsyncStorage for local dev.
const isNative = Platform.OS !== 'web';

const setItem = (key: string, value: string) =>
  isNative ? SecureStore.setItemAsync(key, value) : AsyncStorage.setItem(key, value);
const getItem = (key: string) => (isNative ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key));
const removeItem = (key: string) =>
  isNative ? SecureStore.deleteItemAsync(key) : AsyncStorage.removeItem(key);

export const secureStorage = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([setItem(ACCESS_KEY, tokens.accessToken), setItem(REFRESH_KEY, tokens.refreshToken)]);
  },

  async loadTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([getItem(ACCESS_KEY), getItem(REFRESH_KEY)]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },

  async clearTokens(): Promise<void> {
    await Promise.all([removeItem(ACCESS_KEY), removeItem(REFRESH_KEY)]);
  },
};
