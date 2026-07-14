"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "总览", hint: "Overview", match: (p: string) => p === "/" },
  { href: "/daily/", label: "每日行情", hint: "Daily", match: (p: string) => p.startsWith("/daily") },
  {
    href: "/industry/",
    label: "行业",
    hint: "Sectors",
    match: (p: string) => p.startsWith("/industry"),
  },
  {
    href: "/periods/",
    label: "周期",
    hint: "Periods",
    match: (p: string) => p.startsWith("/periods"),
  },
  {
    href: "/recommend/",
    label: "建议",
    hint: "Plans",
    match: (p: string) => p.startsWith("/recommend"),
  },
  { href: "/review/", label: "复盘", hint: "Review", match: (p: string) => p.startsWith("/review") },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  return (
    <div className="shell-layout">
      <aside className="shell-aside">
        <Link href="/" className="shell-brand">
          <span className="shell-brand-mark">股</span>
          <span className="shell-brand-copy">
            <span className="shell-brand-name">股票新手村</span>
            <span className="shell-brand-tag">学习终端</span>
          </span>
        </Link>

        <nav className="shell-nav" aria-label="主导航">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="shell-aside-foot">
          <span className="status-chip">
            <i />
            数据在线
          </span>
          <p>学习用途 · 不构成投资建议</p>
        </div>
      </aside>

      <div className="shell-main">
        <main>{children}</main>
      </div>
    </div>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return <p className="mt-12 text-center text-xs leading-relaxed text-muted">{text}</p>;
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-sub">{subtitle}</p> : null}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="page-header">
      {kicker ? <p className="page-kicker">{kicker}</p> : null}
      <h1 className="page-title">{title}</h1>
      {description ? <p className="page-desc">{description}</p> : null}
    </header>
  );
}
