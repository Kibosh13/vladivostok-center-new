import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/premium-icons";
import { navItems } from "@/lib/content";

export function SiteHeader() {
  const headerNavItems = navItems.filter((item) => item.href !== "/contacts");
  return (
    <header className="site-header">
      <div className="header-brand-group"><Link className="brand" href="/" aria-label="Путь к себе — главная"><Image className="brand-logo" src="/images/brand/logo-put-k-sebe.png" alt="Международный тренинговый центр «Путь к себе»" width={1280} height={688} priority /></Link><span className="header-city">Владивосток</span></div>
      <nav className="main-nav" aria-label="Основная навигация">
        {headerNavItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>
      <a className="button button-small" href="#consultation">Бесплатный подбор психолога <ArrowIcon /></a>
      <details className="mobile-nav">
        <summary aria-label="Открыть меню"><span /><span /></summary>
        <nav aria-label="Мобильная навигация">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link className="mobile-nav-cta" href="/contacts">Бесплатный подбор психолога <ArrowIcon /></Link>
        </nav>
      </details>
    </header>
  );
}

export function SiteFooter() {
  return (
    <>
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="brand" href="/">
          <Image className="brand-logo brand-logo-footer" src="/images/brand/logo-put-k-sebe.png" alt="Международный тренинговый центр «Путь к себе»" width={1280} height={688} />
        </Link>
        <nav className="footer-nav" aria-label="Навигация в подвале">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="footer-contact">
          <a href="tel:+79146658653">+7 914 665-86-53</a>
          <a href="tg://resolve?phone=79146658653">Написать в Telegram →</a>
          <a href="https://max.ru/" target="_blank" rel="noreferrer">MAX · +7 914 665-86-53</a>
          <a href="https://vk.ru/putkseberu" target="_blank" rel="noreferrer">ВКонтакте</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Путь к себе. Все права защищены.</span>
        <Link href="/privacy">Политика конфиденциальности</Link>
        <Link href="/offer">Договор оферты</Link>
        <Link href="/admin">Админ‑панель</Link>
      </div>
    </footer>
    <nav className="floating-messengers" aria-label="Связаться в мессенджере">
      <a className="messenger-telegram" href="tg://resolve?phone=79146658653" aria-label="Написать в Telegram"><Image src="/images/social/telegram.svg" alt="" width={28} height={28} /></a>
      <a className="messenger-max" href="https://max.ru/" target="_blank" rel="noreferrer" aria-label="Открыть MAX"><Image src="/images/social/max.png" alt="" width={34} height={34} /></a>
    </nav>
    </>
  );
}
