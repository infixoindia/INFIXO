import { plusJakartaSans } from './styles/fonts';

export const metadata = {
  title: 'Infixo',
  description: 'Apno Se Judne Ka Naya Tarika',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}
