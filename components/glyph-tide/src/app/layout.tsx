import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glyph Tide",
  description: "Анимированный прилив из символов.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
