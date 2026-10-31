import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getBlogPosts } from "@/lib/blog";
import { source } from "@/lib/source";
import { TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.URL;

  const docPages = source.getPages().map((page) => ({
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
    priority: 0.7,
    url: `${baseUrl}${page.url}`,
  }));

  const blogPosts = getBlogPosts().map((post) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(post.data.date),
    priority: 0.8,
    url: `${baseUrl}${post.url}`,
  }));

  return [
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
      url: baseUrl,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}/blog`,
    },
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.5,
      url: `${baseUrl}${ROUTES.SPONSOR}`,
    },
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}${ROUTES.TOOLS}`,
    },
    ...TOOLS.map((tool) => ({
      changeFrequency: "monthly" as const,
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}${ROUTES.TOOLS}/${tool.slug}`,
    })),
    ...blogPosts,
    ...docPages,
  ];
}
