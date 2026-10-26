import Link from 'next/link';

/** Keep the action size stable regardless of the attempt's score. */
export function AttemptResultLink({ attemptId }: { attemptId: string }) {
  return <Link href={`/learn/quiz/result/${attemptId}`} className="inline-flex h-11 w-36 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-outline-variant bg-white px-4 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Xem kết quả</Link>;
}
