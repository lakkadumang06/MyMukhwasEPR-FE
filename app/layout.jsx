import './globals.css';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'MyMukhwas ERP',
  description: 'Inventory, production, sales & profit management for MyMukhwas',
  icons: {
    icon: '/favicon.webp',
    shortcut: '/favicon.webp',
    apple: '/favicon.webp',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
