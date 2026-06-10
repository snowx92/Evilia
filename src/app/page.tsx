import { redirect } from 'next/navigation';

export default function HomePage() {
  // Route gating is client-side (token in localStorage). Send everyone to the
  // admin shell — its AuthGuard bounces unauthenticated users to /login.
  redirect('/admin');
}
