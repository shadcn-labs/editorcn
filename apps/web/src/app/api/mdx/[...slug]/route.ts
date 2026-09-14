import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) => {
  const { slug } = await params;
  const filePath = join(
    process.cwd(),
    "content",
    "docs",
    `${slug.join("/").replace(/^docs\//, "")}.mdx`
  );
  try {
    const content = await readFile(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
        "Content-Type": "text/markdown",
      },
    });
  } catch {
    return new NextResponse("Not found", {
      headers: { "Cache-Control": "public, s-maxage=60" },
      status: 404,
    });
  }
};
