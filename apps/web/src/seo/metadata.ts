import type { Metadata } from "next";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

interface CreatePageMetadataOptions {
  description?: string;
  noIndex?: boolean;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogTitle?: string;
  ogType?: "article" | "website";
  path: string;
  title: string;
}

export const createPageMetadata = ({
  description,
  noIndex = false,
  ogDescription,
  ogImage,
  ogImageAlt,
  ogTitle,
  ogType = "website",
  path,
  title,
}: CreatePageMetadataOptions): Metadata => {
  const canonical = path.startsWith(ROUTES.HOME)
    ? path
    : `${ROUTES.HOME}${path}`;
  const resolvedOgImage = ogImage ?? SITE.OG_IMAGE;
  const resolvedTitle = ogTitle ?? title;

  return {
    alternates: {
      canonical,
    },
    description,
    openGraph: {
      description: ogDescription ?? description,
      images: [
        {
          alt: ogImageAlt ?? resolvedTitle,
          height: 630,
          url: resolvedOgImage,
          width: 1200,
        },
      ],
      locale: "en_US",
      siteName: SITE.NAME,
      title: resolvedTitle,
      type: ogType,
      url: `${SITE.URL}${canonical}`,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description: ogDescription ?? description,
      images: [resolvedOgImage],
      title: resolvedTitle,
    },
    ...(noIndex
      ? {
          robots: {
            follow: false,
            index: false,
          },
        }
      : {}),
  };
};

const HOME_TITLE = `shadcn Rich Text Editor Components for React | ${SITE.NAME}`;

export const baseMetadata: Metadata = {
  alternates: {
    canonical: ROUTES.HOME,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE.NAME,
  },
  applicationName: SITE.NAME,
  authors: [{ name: SITE.AUTHOR.NAME, url: LINK.PORTFOLIO }],
  category: "technology",
  creator: SITE.AUTHOR.NAME,
  description: SITE.DESCRIPTION.LONG,
  icons: {
    apple: {
      sizes: "180x180",
      type: "image/png",
      url: "/apple-touch-icon.png",
    },
    icon: [
      {
        sizes: "32x32",
        url: "/favicon.ico",
      },
      {
        sizes: "any",
        type: "image/svg+xml",
        url: "/favicon.svg",
      },
    ],
    shortcut: "/favicon-16x16.png",
  },
  keywords: [...SITE.KEYWORDS],
  metadataBase: new URL(SITE.URL),
  openGraph: {
    description: SITE.DESCRIPTION.LONG,
    images: [
      {
        alt: SITE.NAME,
        height: 630,
        url: SITE.OG_IMAGE,
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: SITE.NAME,
    title: HOME_TITLE,
    type: "website",
    url: SITE.URL,
  },
  publisher: SITE.AUTHOR.NAME,
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE.NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    creator: SITE.AUTHOR.TWITTER,
    description: SITE.DESCRIPTION.LONG,
    images: [SITE.OG_IMAGE],
    site: SITE.AUTHOR.TWITTER,
    title: HOME_TITLE,
  },
};
