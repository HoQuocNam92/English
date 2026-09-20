const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is required');
}

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, '');
