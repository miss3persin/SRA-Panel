import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/contexts/DataContext';
import AppShell from '@/components/layout/AppShell';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mapoly - Student Result Analyzer',
  description: 'Upload, analyze, and visualize student result data for Moshood Abiola Polytechnic with AI insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <DataProvider>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">Loading Mapoly SRA...</p>
            </div>
          }>
            <AppShell>
              {children}
            </AppShell>
          </Suspense>
          <Toaster />
        </DataProvider>
      </body>
    </html>
  );
}
