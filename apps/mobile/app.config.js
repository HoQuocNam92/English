const base = require('./app.json').expo;
module.exports = () => ({
  ...base,
  ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
  extra: {
    ...base.extra,
    ...(process.env.EAS_PROJECT_ID ? { eas: { projectId: process.env.EAS_PROJECT_ID } } : {}),
  },
  android: {
    ...base.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || base.android.googleServicesFile,
  },
});
