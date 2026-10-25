import type { MetadataRoute } from "next";

import { getBlogPosts } from "@/lib/blog";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://editorcn.vercel.app";

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
      priority: 0.9,
      url: `${baseUrl}/docs`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}/blog`,
    },
    ...blogPosts,
    ...docPages,
  ];
}
