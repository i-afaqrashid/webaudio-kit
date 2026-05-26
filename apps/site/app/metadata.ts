import type { Metadata } from "next";

export const SITE_NAME = "webaudio-kit";
export const SITE_URL = new URL("https://webaudio-kit.afaqrashid.com");

export const HOME_DESCRIPTION =
  "React hooks and browser-safe Web Audio primitives for tone tools, frequency sweeps, noise bursts, volume control, and analyser-driven UI.";

export const SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "webaudio-kit browser audio toolkit preview",
};

export type PageMetadataInput = {
  description: string;
  path: `/${string}`;
  title: string;
};

export function createPageMetadata({
  description,
  path,
  title,
}: PageMetadataInput): Metadata {
  const socialTitle = formatSocialTitle(title);

  return {
    title: title === SITE_NAME ? { absolute: SITE_NAME } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

export function formatSocialTitle(title: string) {
  return title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
}
