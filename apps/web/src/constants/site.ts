export const FALLBACK_SITE_ORIGIN = "https://www.rtecn.space" as const;

const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3001";
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.SITE_URL ?? FALLBACK_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "Abdullah Mukadam",
    TWITTER: "@abd_mukadam",
  },
  DESCRIPTION: {
    LONG: "A collection of beautifully designed, accessible, and customizable rich text editor components. Built on Tiptap. Works with shadcn/ui.",
    SHORT: "Beautiful rich text editors, made simple",
  },
  KEYWORDS: [
    "rich text editor",
    "tiptap",
    "react",
    "next.js",
    "shadcn",
    "components",
    "editor",
    "rich text",
    "text editor",
    "text editor components",
    "text editor components for shadcn",
  ] as const,
  NAME: "editorcn",
  OG_IMAGE: `${baseUrl}/og.png`,
  REGISTRY: "@editorcn",
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#09090b",
  light: "#ffffff",
};

export const UTM_PARAMS = {
  utm_source: new URL(baseUrl).hostname,
};
