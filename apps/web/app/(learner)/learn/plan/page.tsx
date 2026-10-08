'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { PlacementPlan } from '@/shared/ui/PlacementPlan';
export default function SavedPlanPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const optimize = async () => { setUpdating(true); setError(''); try { await apiClient.post('/placement-test/plan', {}); setResult(await apiClient.get('/placement-test/result')); } catch (e: any) { setError(e.message); } finally { setUpdating(false); } };
  useEffect(() => { apiClient.get('/placement-test/result').then(setResult).catch((e: any) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <LearnerShell><main className="w-full space-y-5 py-8"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/learn" className="text-sm font-bold text-primary">← Trang chủ</Link><button disabled={updating || loading} onClick={() => void optimize()} className="rounded-xl bg-primary transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{updating ? 'AI đang phân tích…' : 'Tối ưu lộ trình bằng AI'}</button></div>{loading ? <LoadingSpinner /> : result ? <><p className="text-xs text-slate-500">Lộ trình đã lưu · {new Date(result.submittedAt).toLocaleDateString('vi-VN')}</p>{error && <p role="alert" className="text-red-600">{error}</p>}<PlacementPlan result={result} /><Link href="/onboarding/placement-test?next=/learn" className="inline-block text-sm font-bold text-primary">Kiểm tra lại trình độ →</Link></> : <section className="rounded-2xl border bg-white p-6">{error && <p role="alert" className="mb-3 text-red-600">{error}</p>}<h1 className="font-bold">Bạn chưa có kết quả kiểm tra hoặc lộ trình đã lưu</h1><Link href="/onboarding/placement-test?next=/learn" className="mt-4 inline-block text-primary">Làm bài kiểm tra trình độ →</Link></section>}</main></LearnerShell>;
}
