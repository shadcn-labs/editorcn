import { FilterXSS } from "xss";

const EMBED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
  "platform.twitter.com",
]);

const RASTER_DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp|avif)[;,]/i;
const DATA_URL = /^\s*data:/i;

const isEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && EMBED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

const EMBED_ATTRS = [
  "data-type",
  "data-src",
  "data-tweet-id",
  "data-width",
  "data-height",
  "data-align",
  "data-youtube-video",
];

const filter = new FilterXSS({
  css: {
    whiteList: {
      "background-color": true,
      color: true,
      "font-family": true,
      "font-size": true,
      "line-height": true,
      "min-width": true,
      "text-align": true,
      width: true,
    },
  },
  onTagAttr: (tag, name, value) => {
    if (tag === "iframe" && name === "src") {
      return isEmbedUrl(value) ? undefined : "";
    }
    if ((name === "src" || name === "href") && DATA_URL.test(value)) {
      const allowed =
        tag === "img" && name === "src" && RASTER_DATA_IMAGE.test(value.trim());
      return allowed ? undefined : "";
    }
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
  whiteList: {
    a: ["href", "target", "rel"],
    blockquote: [],
    br: [],
    code: ["class"],
    col: ["span", "style"],
    colgroup: [],
    div: [...EMBED_ATTRS, "style"],
    em: [],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    h5: ["style"],
    h6: ["style"],
    hr: [],
    iframe: ["src", "width", "height", "title", "allowfullscreen"],
    img: ["src", "alt", "title", "width", "height", "style"],
    input: ["type", "checked", "disabled"],
    label: [],
    li: ["data-type", "data-checked"],
    mark: ["data-color", "style"],
    ol: ["start", "type"],
    p: ["style"],
    pre: [],
    s: [],
    span: ["style"],
    strong: [],
    sub: [],
    sup: [],
    table: ["style"],
    tbody: [],
    td: ["colspan", "rowspan", "colwidth", "style"],
    tfoot: [],
    th: ["colspan", "rowspan", "colwidth", "style"],
    thead: [],
    tr: [],
    u: [],
    ul: ["data-type"],
  },
});

export const sanitizeHtml = (html: string) => filter.process(html);
