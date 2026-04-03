import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'react-example',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'],
      serverClientId: 'your-google-client-id.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
