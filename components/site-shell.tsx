import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { navItems } from "@/lib/content";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Путь к себе — главная">
        <span className="brand-mark">ПУТЬ.<br />К СЕБЕ</span>
        <span className="brand-note">Психологический центр<br />для предпринимателей<br />и их семей</span>
      </Link>
      <nav className="main-nav" aria-label="Основная навигация">
        {navItems.slice(0, 5).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>
      <a className="button button-small" href="#consultation">Записаться <ArrowRight size={16} /></a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="brand" href="/">
          <span className="brand-mark">ПУТЬ.<br />К СЕБЕ</span>
          <span className="brand-note">Психологический центр<br />для предпринимателей и их семей</span>
        </Link>
        <nav className="footer-nav" aria-label="Навигация в подвале">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="footer-contact">
          <a href="tel:+79964249049">+7 996 424-90-49</a>
          <a href="https://wa.me/79964249049" target="_blank" rel="noreferrer">Написать в WhatsApp →</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Путь к себе. Все права защищены.</span>
        <Link href="/privacy">Политика конфиденциальности</Link>
        <Link href="/offer">Договор оферты</Link>
        <Link href="/admin">Админ‑панель</Link>
      </div>
    </footer>
  );
}
