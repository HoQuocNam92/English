'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { LearningPathJourney } from '@/shared/ui/LearningPathJourney';
export default function SavedPlanPage() {
  const [available, setAvailable] = useState<boolean | null>(null);
  return <LearnerShell><div className="w-full space-y-5 py-4 sm:py-8">
    <LearningPathJourney full onAvailability={setAvailable} />
    {available === false && <p className="text-sm text-on-surface-variant">Chọn mục tiêu và chuyên ngành để bắt đầu lộ trình. <Link href="/learn/profile?tab=goals" className="font-semibold text-primary">Thiết lập mục tiêu →</Link></p>}
  </div></LearnerShell>;
}
