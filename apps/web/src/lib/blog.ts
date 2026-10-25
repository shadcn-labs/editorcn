import { blog } from "collections/server";
import { loader } from "fumadocs-core/source";

import { ROUTES } from "@/constants/routes";

export const blogSource = loader({
  baseUrl: ROUTES.BLOG,
  source: blog.toFumadocsSource(),
});

export const getBlogPosts = () =>
  blogSource
    .getPages()
    .toSorted(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

export const formatPostDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
