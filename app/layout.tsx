import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import { MobileShell } from '../components/layout/MobileShell';
import { Providers } from '../components/Providers';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Tampuhay App',
  description: 'Informal Savings Group Manager',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <MobileShell
            groupName="Kaberks">
            {children}
          </MobileShell>
        </Providers>
      </body>
    </html>
  );
}