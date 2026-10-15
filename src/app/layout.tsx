import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'FixNear',
  description: 'Connect with local repair technicians and workshops in Sri Lanka',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-base text-ink-primary font-base antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
