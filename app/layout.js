import { plusJakartaSans } from './styles/fonts';
import './styles/globals.css';

export const metadata = {
  title: 'Infixo',
  description: 'Apno Se Judne Ka Naya Tarika',
  icons: {
    icon: [{ url: '/images/logo.png', type: 'image/png' }],
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}
