import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PiProvider } from '@/components/PiProvider';
import { ToastProvider } from '@/components/ToastProvider';
import { CartProvider } from '@/components/CartProvider';
import { FavoritesProvider } from '@/components/FavoritesProvider';
import { RequirePiAuth } from '@/components/RequirePiAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PiMarket - La Marketplace Publique Pi Network',
  description: 'Achetez et vendez facilement des articles avec vos pièces Pi. Paiements instantanés et sécurisés via Pi SDK v2.0.',
  keywords: ['Pi Network', 'Marketplace', 'Pi Coin', 'Achat Pi', 'Vente Pi', 'Web3 Commerce'],
  openGraph: {
    title: 'PiMarket - La Marketplace Publique Pi Network',
    description: 'Achetez et vendez facilement des articles avec vos pièces Pi.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col text-slate-900 antialiased`}>
        <ToastProvider>
          <PiProvider>
            <CartProvider>
              <FavoritesProvider>
                <RequirePiAuth>
                  <Navbar />
                  <main className="flex-1 flex flex-col">
                    {children}
                  </main>
                  <Footer />
                </RequirePiAuth>
              </FavoritesProvider>
            </CartProvider>
          </PiProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

