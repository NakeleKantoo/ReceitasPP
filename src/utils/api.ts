import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '3069';

function normalizeBaseUrl(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}

function extractExpoHost() {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null;
  const manifest = Constants.manifest as { debuggerHost?: string } | null;
  const hostUri = expoConfig?.hostUri ?? manifest?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] ?? null;
}

function resolveDefaultApiUrl() {
  const expoHost = extractExpoHost();

  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return `http://${expoHost}:${API_PORT}/`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}/`;
  }

  return `http://127.0.0.1:${API_PORT}/`;
}

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const RECEITAS_API = {
  base_url: normalizeBaseUrl(configuredBaseUrl || resolveDefaultApiUrl()),
};
