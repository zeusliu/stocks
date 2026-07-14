"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "总览", match: (p: string) => p === "/" },
  { href: "/daily/", label: "每日行情", match: (p: string) => p.startsWith("/daily") },
  { href: "/industry/", label: "行业", match: (p: string) => p.startsWith("/industry") },
  { href: "/periods/", label: "周期", match: (p: string) => p.startsWith("/periods") },
  { href: "/recommend/", label: "建议", match: (p: string) => p.startsWith("/recommend") },
  { href: "/review/", label: "复盘", match: (p: string) => p.startsWith("/review") },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  return (
    <div className="shell-layout">
      <aside className="shell-aside">
        <Link href="/" className="shell-brand">
          <span className="shell-brand-mark">股</span>
          <span className="shell-brand-name">股票新手村</span>
        </Link>

        <nav className="shell-nav">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link key={link.href} href={link.href} className={active ? "is-active" : undefined}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="shell-aside-foot">
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
  return <p className="mt-10 text-center text-xs leading-relaxed text-muted">{text}</p>;
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
    <header className="page-header flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        <h1 className="page-title">{title}</h1>
      </div>
      {description ? (
        <p className="max-w-md text-right text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
