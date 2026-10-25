import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glyph Ember',
  description: 'Анимированное ASCII-пламя с настраиваемыми цветами, искрами и взаимодействием.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
