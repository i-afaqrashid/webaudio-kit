import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "webaudio-kit",
    template: "%s | webaudio-kit",
  },
  description:
    "Small React and TypeScript primitives for safe browser tone generation, frequency sweeps, volume control, and analyser-driven UI.",
  metadataBase: new URL("https://webaudio-kit.afaqrashid.com"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "webaudio-kit",
    description:
      "React hooks and browser-safe Web Audio primitives for tone tools and frequency sweep prototypes.",
    images: ["/assets/demo-screenshot.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f6ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
