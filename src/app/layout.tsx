import type { Metadata } from 'next';
import { Tajawal, Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';

const tajawal = Tajawal({
  variable: '--font-arabic',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Evilia — لوحة الإدارة',
  description: 'Modern admin control plane for Evilia — sales, commissions, wallets, and access.',
  icons: {
    icon: [{ url: '/favicon.jpeg', type: 'image/jpeg' }],
    shortcut: '/favicon.jpeg',
    apple: '/favicon.jpeg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // dir/lang pre-set for first paint; DirectionProvider keeps them in sync post-login.
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
