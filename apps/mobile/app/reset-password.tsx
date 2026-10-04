import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { api } from '../src/shared/api/api-client';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Button, Text, TextInput, controlStyles } from '../src/shared/ui/primitives';
export default function ResetPassword() {
 const params = useLocalSearchParams<{ token?: string }>(); const router = useRouter();
 const [link, setLink] = useState(params.token || ''); const [token, setToken] = useState('');
 const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
 const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false);
 const validate = async (value: string) => {
  setToken(''); setError(''); let candidate = value.trim();
  try { if (candidate.includes('://')) candidate = new URL(candidate).searchParams.get('token') || ''; } catch { candidate = ''; }
  if (!/^[a-f0-9]{64}$/.test(candidate)) { setError('Liên kết không hợp lệ. Hãy dán đầy đủ liên kết trong email.'); return; }
  setBusy(true); try { const result = await api.post<{ valid: boolean }>('/auth/validate-password-reset', { token: candidate }); if (!result.valid) throw new Error('Liên kết đã hết hạn hoặc đã được sử dụng.'); setToken(candidate); } catch (cause: any) { setError(cause.message); } finally { setBusy(false); }
 };
 useEffect(() => { if (params.token) { setLink(params.token); void validate(params.token); } }, [params.token]);
 const submit = async () => {
  if (password.length < 6 || password.length > 72 || password !== confirm) { setError('Mật khẩu phải có 6–72 ký tự và khớp với xác nhận.'); return; }
  setBusy(true); setError(''); try { await api.post('/auth/reset-password', { token, newPassword: password }); setSuccess(true); setToken(''); setPassword(''); setConfirm(''); } catch (cause: any) { setError(cause.message); } finally { setBusy(false); }
 };
 return <FeatureScreen title="Đặt lại mật khẩu"><View style={[controlStyles.card, { gap: 14 }]}>{success ? <><Text>Đặt lại mật khẩu thành công.</Text><Button onPress={() => router.replace('/(auth)/login' as any)}>Đăng nhập</Button></> : <>{!token ? <><Text>Dán liên kết đặt lại mật khẩu đã nhận trong email.</Text><TextInput accessibilityLabel="Liên kết đặt lại mật khẩu" value={link} onChangeText={setLink} autoCapitalize="none"/><Button disabled={busy} onPress={() => void validate(link)}>Kiểm tra liên kết</Button></> : <><TextInput accessibilityLabel="Mật khẩu mới" placeholder="Mật khẩu mới" value={password} onChangeText={setPassword} secureTextEntry maxLength={72}/><TextInput accessibilityLabel="Xác nhận mật khẩu" placeholder="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} secureTextEntry maxLength={72}/><Button disabled={busy || password.length < 6 || password !== confirm} onPress={submit}>Đặt lại mật khẩu</Button></>}{error ? <Text accessibilityRole="alert" style={{ color: '#b91c1c' }}>{error}</Text> : null}<Button onPress={() => router.push('/(auth)/forgot-password' as any)}>Yêu cầu liên kết mới</Button></>}</View></FeatureScreen>;
}
