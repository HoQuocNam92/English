const fs = require('fs');
const path = require('path');
const base = require('./app.json').expo;
module.exports = () => ({
  ...base,
  ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
  plugins: [
    ...base.plugins,
    // Android uses native autolinking; this plugin adds the iOS callback scheme.
    ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ? [
      ['@react-native-google-signin/google-signin', {
        iosUrlScheme: `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.replace('.apps.googleusercontent.com', '')}`,
      }],
    ] : []),
  ],
  extra: {
    ...base.extra,
    ...(process.env.EAS_PROJECT_ID ? { eas: { projectId: process.env.EAS_PROJECT_ID } } : {}),
  },
  android: {
    ...base.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || (base.android.googleServicesFile && fs.existsSync(path.resolve(__dirname, base.android.googleServicesFile)) ? base.android.googleServicesFile : undefined),
  },
});
