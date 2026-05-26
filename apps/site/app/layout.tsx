import type { Metadata, Viewport } from "next";
import {
  HOME_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "./metadata";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  authors: [{ name: "Afaq Rashid", url: "https://github.com/i-afaqrashid" }],
  creator: "Afaq Rashid",
  publisher: "Afaq Rashid",
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  metadataBase: SITE_URL,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    url: "/",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
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
