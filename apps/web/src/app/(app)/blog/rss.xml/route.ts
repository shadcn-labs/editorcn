import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { getBlogPosts } from "@/lib/blog";

export const revalidate = false;

const DESCRIPTION =
  "Guides and tutorials for building rich text editors in React with Tiptap and shadcn/ui.";

export const GET = () => {
  const items = getBlogPosts()
    .map((post) => {
      const link = `${SITE.URL}${post.url}`;
      const date = new Date(post.data.date).toUTCString();

      return `    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${post.data.description || ""}]]></description>
      <dc:creator><![CDATA[${post.data.author}]]></dc:creator>
      <pubDate>${date}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE.NAME} Blog</title>
    <link>${SITE.URL}${ROUTES.BLOG}</link>
    <description>${DESCRIPTION}</description>
    <language>en-us</language>
    <atom:link href="${SITE.URL}${ROUTES.BLOG_RSS}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
