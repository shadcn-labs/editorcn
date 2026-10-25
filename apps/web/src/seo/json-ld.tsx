import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

const JsonLdScript = ({ data }: { data: Record<string, unknown> }) => (
  <script
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; path: string }[];
}) => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        item: `${SITE.URL}${item.path.startsWith(ROUTES.HOME) ? item.path : `${ROUTES.HOME}${item.path}`}`,
        name: item.name,
        position: index + 1,
      })),
    }}
  />
);

export const WebSiteJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      description: SITE.DESCRIPTION.LONG,
      name: SITE.NAME,
      potentialAction: {
        "@type": "SearchAction",
        "query-input": "required name=search_term_string",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE.URL}/docs?q={search_term_string}`,
        },
      },
      url: SITE.URL,
    }}
  />
);

export const BlogPostingJsonLd = ({
  author,
  date,
  description,
  path,
  title,
}: {
  author: string;
  date: string;
  description?: string;
  path: string;
  title: string;
}) => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      author: { "@type": "Person", name: author },
      datePublished: date,
      description,
      headline: title,
      image: SITE.OG_IMAGE,
      mainEntityOfPage: `${SITE.URL}${path}`,
      publisher: { "@type": "Organization", name: SITE.NAME, url: SITE.URL },
    }}
  />
);

export const SoftwareApplicationJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      applicationCategory: "DeveloperApplication",
      description: SITE.DESCRIPTION.LONG,
      name: SITE.NAME,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Web",
      url: SITE.URL,
    }}
  />
);
