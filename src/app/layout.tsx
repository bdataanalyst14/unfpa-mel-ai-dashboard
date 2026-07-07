import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UNFPA MEL Intelligence Dashboard',
  description: 'Static prototype of UNFPA Nepal MEL Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-canvas-bg min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
