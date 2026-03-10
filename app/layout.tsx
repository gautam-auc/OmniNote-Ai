import type { Metadata } from 'next';
import { inter, spaceGrotesk } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniNote AI | Your Intelligent Knowledge Base',
  description: 'AI-powered notes, blog content, and product reviews in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-[#f5f5f5] text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
