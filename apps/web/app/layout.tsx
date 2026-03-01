import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LeagueLore — Your Fantasy Football History, Unlocked',
  description:
    'Connect your fantasy football league and unlock decades of history, rivalries, analytics, and AI-powered recaps.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
