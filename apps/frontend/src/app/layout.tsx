import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import JackpotNotifications from '@/components/JackpotNotifications';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CasinoBit - Provably Fair Casino',
  description: 'Play provably fair casino games with cryptocurrency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <JackpotNotifications />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
