'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { PlacementPlan } from '@/shared/ui/PlacementPlan';
import { LearningPathJourney } from '@/shared/ui/LearningPathJourney';
export default function SavedPlanPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [livePath, setLivePath] = useState<boolean | null>(null);
  const optimize = async () => { setUpdating(true); setError(''); try { await apiClient.post('/placement-test/plan', {}); setResult(await apiClient.get('/placement-test/result')); } catch (e: any) { setError(e.message); } finally { setUpdating(false); } };
  useEffect(() => { apiClient.get('/placement-test/result').then(setResult).catch((e: any) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <LearnerShell><div className="w-full space-y-5 py-4 sm:py-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/learn" className="text-sm font-bold text-primary">← Trang chủ</Link>{livePath === false && <button disabled={updating || loading} onClick={() => void optimize()} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{updating ? 'Đang phân tích…' : 'Tối ưu lộ trình bằng AI'}</button>}</div>
    <LearningPathJourney full onAvailability={setLivePath} />
    {livePath === true && result && !result.selfSelected && typeof result.total === 'number' && <details className="rounded-2xl border border-outline-variant bg-white p-4"><summary className="cursor-pointer text-sm font-semibold">Kết quả kiểm tra đã lưu</summary><p className="mt-3 text-sm">Đúng {result.correct}/{result.total} câu · {result.percent}%</p></details>}
    {livePath === false && (loading ? <LoadingSpinner /> : result ? <>{error && <p role="alert" className="text-red-600">{error}</p>}<PlacementPlan result={result} /><Link href="/onboarding/placement-test?next=/learn/plan" className="inline-block text-sm font-bold text-primary">Kiểm tra lại trình độ →</Link></> : <section className="rounded-2xl border bg-white p-6">{error && <p role="alert" className="mb-3 text-red-600">{error}</p>}<h1 className="font-bold">Bạn chưa có lộ trình đã lưu</h1><Link href="/learn/profile?tab=goals" className="mt-4 inline-block text-primary">Thiết lập mục tiêu học →</Link></section>)}
  </div></LearnerShell>;
}
