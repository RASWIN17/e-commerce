import type { Metadata } from 'next';
import './globals.css';
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { CartProvider } from '../lib/cart-context';

export const metadata: Metadata = {
  title: 'IMAGIX — Wear What Feels Like You | Minimal D2C Fashion India',
  description: 'Premium heavyweight cotton streetwear, minimal graphic tees, and accessories tailored and printed in India.',
  metadataBase: new URL('https://imagix.in'),
  openGraph: {
    title: 'IMAGIX — Wear What Feels Like You',
    description: 'Minimal, comfortable, timeless print-on-demand fashion.',
    url: 'https://imagix.in',
    siteName: 'IMAGIX',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#171717] selection:bg-[#171717] selection:text-white">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

