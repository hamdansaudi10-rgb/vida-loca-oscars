import { Inter, Tajawal } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-latin', display: 'swap' });
const tajawal = Tajawal({ subsets: ['arabic', 'latin'], weight: ['400', '500', '700', '800'], variable: '--font-arabic', display: 'swap' });

export const metadata = {
  title: 'VIDA LOCA OSCARS',
  description: "The nominations are in. It's time to vote.",
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${tajawal.variable}`}>{children}</body>
    </html>
  );
}
