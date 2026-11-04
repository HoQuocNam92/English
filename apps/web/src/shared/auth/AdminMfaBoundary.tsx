'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { AUTH_SESSION_KEY, sessionStorageTarget } from '@/shared/storage';
import { useAuth } from '@/features/auth/presentation';

type Status = { required: boolean; enabled: boolean; verified: boolean };
export function AdminMfaBoundary({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState('');
  const [recover, setRecover] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const check = useCallback(async () => {
    try { setError(''); setStatus(await apiClient.get<Status>('/auth/mfa/status')); }
    catch (e: any) { setError(e.message ?? 'Không thể kiểm tra MFA'); }
  }, []);
  useEffect(() => {
    void check();
    const reset = () => { void check(); };
    window.addEventListener('techenglish:mfa-required', reset);
    // Recheck on focus and periodically so an eight-hour session cannot keep the portal open indefinitely.
    window.addEventListener('focus', reset);
    const timer = window.setInterval(reset, 60000);
    return () => { window.removeEventListener('techenglish:mfa-required', reset); window.removeEventListener('focus', reset); window.clearInterval(timer); };
  }, [check]);
  const begin = async () => {
    setBusy(true); setError('');
    try { setSetup(await apiClient.post('/auth/mfa/setup', {})); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };
  const verify = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await apiClient.post<{ accessToken?: string; recoveryCodes?: string[]; reenrollRequired?: boolean }>('/auth/mfa/verify', { code, recover });
      if (result.reenrollRequired) {
        setCode(''); setSetup(null); setRecover(false); setNotice('Mã khôi phục đã được xác nhận. Hãy thiết lập ứng dụng mới để vào quản trị; bộ mã khôi phục cũ đã bị hủy.');
        await check();
        return;
      }
      if (!result.accessToken) throw new Error('Máy chủ chưa hoàn tất xác thực. Vui lòng thử lại.');
      const storage = sessionStorageTarget();
      const session = JSON.parse(storage.getItem(AUTH_SESSION_KEY) ?? 'null');
      if (!session) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      storage.setItem(AUTH_SESSION_KEY, JSON.stringify({ ...session, accessToken: result.accessToken }));
      setCode(''); setSetup(null);
      if (result.recoveryCodes?.length) setCodes(result.recoveryCodes);
      await check();
    } catch (e: any) { setError(e.message ?? 'Không thể xác thực'); }
    finally { setBusy(false); }
  };
  if (status?.verified && !codes) return <>{children}</>;
  return <main className="min-h-screen bg-surface-container-low px-4 py-12"><div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-bold">{codes ? 'Lưu mã khôi phục MFA' : 'Xác thực để vào quản trị'}</h1>
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
    {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
    {codes ? <>
      <p className="text-sm">Mỗi mã dùng được một lần khi bạn mất ứng dụng xác thực. Lưu các mã ở nơi riêng tư trước khi tiếp tục. Các mã chỉ hiển thị lần này.</p>
      <pre className="select-all rounded-lg bg-slate-100 p-4 text-sm">{codes.join('\n')}</pre>
      <button className="rounded-xl bg-primary px-4 py-3 font-bold text-white" onClick={() => { setCodes(null); }}>Tôi đã lưu mã, vào quản trị</button>
    </> : !status ? <><p>Đang kiểm tra phiên xác thực…</p><button className="text-primary" onClick={() => void check()}>Thử lại</button></> : <>
      <p className="text-sm">{status.enabled ? 'Nhập mã 6 số trong Google Authenticator hoặc Microsoft Authenticator. Bạn cũng có thể dùng một mã khôi phục.' : 'Thiết lập ứng dụng xác thực để bảo vệ tài khoản trước khi sử dụng khu vực quản trị.'}</p>
      {!status.enabled && !setup && <button disabled={busy} onClick={() => void begin()} className="rounded-xl bg-primary px-4 py-3 font-bold text-white">Thiết lập ứng dụng xác thực</button>}
      {setup && <div className="space-y-3 text-sm"><p>Trong ứng dụng xác thực, chọn thêm tài khoản bằng khóa thiết lập, chọn mã theo thời gian và nhập khóa sau:</p><code className="block select-all break-all rounded-lg bg-slate-100 p-3">{setup.secret}</code><a className="block font-semibold text-primary" href={setup.uri}>Mở ứng dụng xác thực trên thiết bị này</a><p>Khóa thiết lập hết hạn sau 10 phút.</p><button className="text-primary" disabled={busy} onClick={() => void begin()}>Tải lại khóa thiết lập</button></div>}
      {status.enabled && <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={recover} onChange={e => setRecover(e.target.checked)} />Dùng mã khôi phục để thay ứng dụng xác thực đã mất</label>}{(status.enabled || setup) && <form onSubmit={verify} className="space-y-3"><label className="block text-sm font-semibold" htmlFor="admin-mfa-code">Mã xác thực hoặc mã khôi phục</label><input id="admin-mfa-code" value={code} onChange={e => setCode(e.target.value)} autoComplete="one-time-code" maxLength={40} required className="w-full rounded-xl border border-outline-variant p-3" /><button disabled={busy || code.trim().length < 6} className="rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Đang xác thực…' : 'Xác thực'}</button></form>}
    </>}
    <button onClick={() => void signOut()} className="block text-sm text-on-surface-variant">Đăng xuất</button>
  </div></main>;
}
