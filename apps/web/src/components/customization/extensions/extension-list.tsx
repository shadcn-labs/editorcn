import Link from "next/link";

import registry from "../../../../public/r/registry.json";

const EXTENSIONS = registry.items.filter((item) =>
  item.files.some((file) => file.path.startsWith(`extensions/${item.name}/`))
);

export const ExtensionList = () => (
  <div className="grid gap-2 text-sm sm:grid-cols-2">
    {EXTENSIONS.map((item) => (
      <Link
        key={item.name}
        className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        href={`/docs/extensions/${item.name}`}
      >
        {item.title}
      </Link>
    ))}
  </div>
);
