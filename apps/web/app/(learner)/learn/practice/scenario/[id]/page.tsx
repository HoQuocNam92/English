import { redirect } from 'next/navigation';

export default function LegacyPage() {
  redirect('/learn/lessons?type=case_study');
}
