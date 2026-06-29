import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';

const thmanyahSans = localFont({
  src: [
    { path: '../../public/fonts/thmanyahsans-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/thmanyahsans-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/thmanyahsans-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/thmanyahsans-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/thmanyahsans-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-arabic',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Luna Care — لوحة الإدارة',
  description: 'Modern admin control plane for Luna Care — sales, commissions, wallets, and access.',
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
      className={`${thmanyahSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
