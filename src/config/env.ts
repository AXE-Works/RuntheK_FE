function readEnv(key: string, fallback = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as Record<string, string | undefined>)[key] ?? fallback;
  }
  return fallback;
}

export const env = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL', 'http://localhost:8080/api/v1'),
  scheduleApiBaseUrl: readEnv('VITE_AI_API_BASE_URL', 'https://runthek-api.onrender.com/api/v1'),
  promptApiBaseUrl: readEnv('VITE_AI_API_BASE_URL', 'https://runthek-api.onrender.com/api/v1'),
  googleMapsApiKey: readEnv('VITE_GOOGLE_MAPS_API_KEY', ''),
  googleClientId: readEnv('VITE_GOOGLE_CLIENT_ID', ''),
} as const;
