import type { Metadata } from "next";
import { SiteMotion } from "@/components/site-motion";
import "./globals.css";

export const metadata: Metadata = {
  title: "Путь к себе — психологический центр во Владивостоке",
  description: "Работа с предпринимателями, руководителями и семьями: состояние, отношения, решения и рост без выгорания.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body><SiteMotion />{children}</body>
    </html>
  );
}
