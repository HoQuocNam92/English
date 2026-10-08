// Standalone builds must be able to start without a local .env file.
// Keep the deployed API as the default; development builds can override it.
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://api.techenglish.click/api/v1';

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, '');
