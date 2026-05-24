import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Gauge,
  Package,
  Radio,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";

const icons = {
  activity: Activity,
  book: BookOpen,
  gauge: Gauge,
  package: Package,
  radio: Radio,
  rocket: Rocket,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  terminal: TerminalSquare,
  volume: Volume2,
  waves: Waves,
  zap: Zap,
};

export type IconName = keyof typeof icons;

export function IconBadge({ name }: { name: IconName }) {
  const Icon = icons[name];

  return (
    <span className="iconBadge" aria-hidden="true">
      <Icon size={18} strokeWidth={2.2} />
    </span>
  );
}

export function CodeBlock({
  children,
  title,
}: {
  children: string;
  title?: string;
}) {
  return (
    <div className="codeCard">
      {title ? <div className="codeTitle">{title}</div> : null}
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function Terminal({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="terminal">
      <div className="terminalTop">
        <span>{title}</span>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export function PageShell({
  active,
  children,
}: {
  active?: "home" | "docs" | "roadmap";
  children: ReactNode;
}) {
  return (
    <>
      <header className="siteHeader">
        <Link className="brand" href="/">
          <span className="brandMark" aria-hidden="true">
            <Waves size={19} strokeWidth={2.4} />
          </span>
          <span>webaudio-kit</span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link
            className={active === "docs" ? "active" : undefined}
            href="/docs"
          >
            Docs
          </Link>
          <Link
            className={active === "roadmap" ? "active" : undefined}
            href="/roadmap"
          >
            Roadmap
          </Link>
          <a href="https://github.com/i-afaqrashid/webaudio-kit">GitHub</a>
        </nav>
      </header>
      {children}
    </>
  );
}

export function SectionHeader({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="sectionHeader">
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}
