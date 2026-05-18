import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Apex Alpha Portfolio Simulator',
  description: 'No-gameplay App Router shell for the Apex Alpha Portfolio Simulator MVP.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
