# Google login on Android

The Android app uses native Google Sign-In and sends its ID token to
`POST /api/v1/auth/google/mobile`. Expo Go cannot load the native SDK; use a
development build or preview APK. Email/password login remains available in Expo Go.

1. In the same Google Cloud project as the backend Web OAuth client, create an
   **Android OAuth client** with package `com.techenglish.pro` and the SHA-1 of the
   certificate signing your APK. Use `npx eas-cli@latest credentials -p android`
   to inspect/configure EAS signing credentials. Register each signing certificate
   used by development, preview, or Play Store builds. The Android client ID does
   not go into `GoogleSignin.configure`: the SDK identifies Android by package and
   signing certificate.
2. Set these variables locally and in the EAS environment used by the build:
   - `EXPO_PUBLIC_API_URL=https://api.techenglish.click/api/v1`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web OAuth client ID used by the backend>`
   The existing `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is also accepted as a fallback.
   Never put the Google client secret in the app.
3. From `apps/mobile`, sign in and link the EAS project if needed:
   ```sh
   npx eas-cli@latest login
   npx eas-cli@latest init
   npx eas-cli@latest build --platform android --profile development
   ```
4. Install the resulting APK and run:
   ```sh
   pnpm exec expo start --dev-client --clear
   ```
   Open the installed TechEnglish app rather than Expo Go. For an APK that runs
   without Metro, build with `--profile preview` instead.
5. Verify Google account selection, cancellation, successful navigation to home,
   and authenticated API requests. A `DEVELOPER_ERROR` usually indicates a
   package/SHA-1/Web-client mismatch. A backend audience error means the Web client
   ID is not included in the backend's allowed Google audiences.

Google Sign-In itself does not require Firebase. If a real `google-services.json`
is present (or `GOOGLE_SERVICES_JSON` is set), it is retained for Android Firebase
features such as push notifications. Without it, remote push needs separate setup.

iOS requires a separate iOS OAuth client for `com.techenglish.pro`. Set
`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` before building; the config adds its URL scheme.
Do not substitute the Web client ID for the iOS client ID.

References:
- https://docs.expo.dev/guides/google-authentication/
- https://react-native-google-signin.github.io/docs/setting-up/get-config-file
