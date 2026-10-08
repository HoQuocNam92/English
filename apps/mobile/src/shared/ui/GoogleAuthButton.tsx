import { useEffect, useRef, type ReactNode } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { TouchableOpacity } from './primitives';

type Props = {
  clientId?: string;
  disabled: boolean;
  style: StyleProp<ViewStyle>;
  children: ReactNode;
  onNativePress: () => Promise<void>;
  onIdToken: (token: string) => Promise<void>;
  onError: (message: string) => void;
};

// Only the configured web button mounts the browser OAuth hook.
// Android/iOS use the native Google SDK when the button is pressed.
export function GoogleAuthButton(props: Props) {
  if (!props.clientId?.trim()) {
    return <TouchableOpacity style={props.style} activeOpacity={0.8} disabled={props.disabled} onPress={() => props.onError('Google hiện chưa khả dụng. Vui lòng dùng email hoặc thử lại sau.')}>{props.children}</TouchableOpacity>;
  }
  if (Platform.OS === 'web') return <WebGoogleAuthButton {...props} />;
  return <TouchableOpacity style={props.style} activeOpacity={0.8} disabled={props.disabled} onPress={props.onNativePress}>{props.children}</TouchableOpacity>;
}

function WebGoogleAuthButton(props: Props) {
  const callbacks = useRef(props);
  callbacks.current = props;
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: props.clientId,
    webClientId: props.clientId,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => { WebBrowser.maybeCompleteAuthSession(); }, []);
  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.idToken ?? response.params.id_token;
      if (token) void callbacks.current.onIdToken(token).catch(error => callbacks.current.onError(error instanceof Error ? error.message : 'Không thể xác thực với Google.'));
      else callbacks.current.onError('Google không trả về ID token. Vui lòng thử lại.');
    } else if (response?.type === 'error') {
      callbacks.current.onError(response.error?.message ?? 'Không thể xác thực với Google.');
    }
  }, [response]);

  const start = async () => {
    try { await promptAsync(); }
    catch (error) { props.onError(error instanceof Error ? error.message : 'Không thể mở Google.'); }
  };
  return <TouchableOpacity style={props.style} activeOpacity={0.8} disabled={props.disabled || !request} onPress={start}>{props.children}</TouchableOpacity>;
}
