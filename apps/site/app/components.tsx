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
  active?: "home" | "docs" | "demos";
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
            className={active === "demos" ? "active" : undefined}
            href="/demos"
          >
            Demos
          </Link>
          <a
            className="externalNavLink"
            href="https://github.com/i-afaqrashid/webaudio-kit"
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMark />
            <span>GitHub</span>
          </a>
        </nav>
      </header>
      {children}
    </>
  );
}

export function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      className="githubMark"
      focusable="false"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 1.4a6.7 6.7 0 0 0-2.1 13c.34.06.46-.15.46-.33v-1.2c-1.9.41-2.3-.8-2.3-.8-.31-.78-.76-.99-.76-.99-.62-.42.05-.41.05-.41.68.05 1.04.7 1.04.7.61 1.04 1.59.74 1.98.57.06-.44.24-.74.43-.91-1.5-.17-3.08-.75-3.08-3.34 0-.74.26-1.34.7-1.81-.07-.17-.3-.86.07-1.79 0 0 .57-.18 1.86.69A6.45 6.45 0 0 1 8 4.25c.57 0 1.14.08 1.68.23 1.28-.87 1.85-.69 1.85-.69.37.93.14 1.62.07 1.79.44.47.7 1.07.7 1.81 0 2.6-1.58 3.17-3.09 3.34.25.21.46.62.46 1.25v2.09c0 .18.12.39.47.33A6.7 6.7 0 0 0 8 1.4Z"
        fill="currentColor"
      />
    </svg>
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
