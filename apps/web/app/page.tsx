import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles actual redirect logic
  // This is a fallback for server render
  redirect('/login');
}
