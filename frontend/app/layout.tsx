import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Demo',
  description: 'Suivi commercial interne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <nav className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-8">
            <span className="font-semibold text-gray-900 text-sm tracking-wide">
              CRM
            </span>
            <Link
              href="/clients"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clients
            </Link>
            <Link
              href="/opportunities"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Opportunités
            </Link>
            <Link
              href="/pipeline"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pipeline
            </Link>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}