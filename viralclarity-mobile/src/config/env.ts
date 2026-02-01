import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const CUSTOM_URL_KEY = 'VC_WEB_URL';

export const DEFAULT_PROD_URL = 'https://viralclarityio-101.vercel.app';

const DEV_ENV_WEB_URL =
  __DEV__ ? process.env.EXPO_PUBLIC_APP_WEB_URL ?? Constants.expoConfig?.extra?.APP_WEB_URL : undefined;

export const APP_WEB_URL = DEV_ENV_WEB_URL || DEFAULT_PROD_URL;

export async function getInitialWebUrl(): Promise<string> {
  const savedUrl = await AsyncStorage.getItem(CUSTOM_URL_KEY);
  if (savedUrl && savedUrl.trim().length > 0) {
    return savedUrl;
  }
  return APP_WEB_URL;
}

export async function saveCustomWebUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(CUSTOM_URL_KEY, url);
}

export async function clearCustomWebUrl(): Promise<void> {
  await AsyncStorage.removeItem(CUSTOM_URL_KEY);
}
