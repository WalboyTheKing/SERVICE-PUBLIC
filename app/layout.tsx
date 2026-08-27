import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PiProvider } from '@/components/PiProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pi Network Public Marketplace',
  description: 'Marketplace publique intégrée à Pi Network',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col text-gray-800`}>
        <PiProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </PiProvider>
      </body>
    </html>
  );
}