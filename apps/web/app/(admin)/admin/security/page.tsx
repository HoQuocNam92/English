'use client';
import { useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { PageHeader } from '@/shared/ui/PageHeader';
export default function AdminSecurityPage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="admin-page-stack max-w-2xl p-6"><PageHeader title="Bảo mật tài khoản" icon="security" /><div className="space-y-4 rounded-2xl border border-outline-variant bg-white p-6"><h2 className="text-lg font-semibold">Thay ứng dụng xác thực</h2><p className="text-sm">Dùng khi đổi điện thoại hoặc khôi phục bằng mã dự phòng. Nhập một mã xác thực mới hoặc một mã khôi phục chưa dùng để thiết lập lại. Sau đó, mọi thiết bị phải xác thực lại MFA và bộ mã khôi phục cũ sẽ bị hủy.</p>{error && <p role="alert" className="text-error">{error}</p>}<form className="space-y-3" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try { await apiClient.post('/auth/mfa/reconfigure', { code }); window.location.reload(); } catch (e: any) { setError(e.message); } finally { setBusy(false); } }}><label htmlFor="reconfigure-code" className="block text-sm font-semibold">Mã xác thực hoặc mã khôi phục</label><input id="reconfigure-code" value={code} onChange={e => setCode(e.target.value)} autoComplete="one-time-code" required maxLength={40} className="w-full rounded-xl border p-3" /><button disabled={busy || code.length < 6} className="rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Đang kiểm tra…' : 'Xác thực và thiết lập lại'}</button></form></div></div>;
}
