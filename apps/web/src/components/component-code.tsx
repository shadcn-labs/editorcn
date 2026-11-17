import { CopyButton } from "@/components/copy-button";
import { getIconForLanguageExtension } from "@/components/icons";
import { cn } from "@/lib/utils";

export const ComponentCode = ({
  code,
  highlightedCode,
  language,
  title,
  className,
  copyButtonClassName,
}: {
  code: string;
  highlightedCode: string;
  language: string;
  title: string | undefined;
  className?: string;
  copyButtonClassName?: string;
}) => (
  <figure
    data-rehype-pretty-code-figure=""
    className={cn("[&>pre]:max-h-96", className)}
  >
    {title ? (
      <figcaption
        className="text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70"
        data-language={language}
        data-rehype-pretty-code-title=""
      >
        {getIconForLanguageExtension(language)}
        <span className="min-w-0 truncate">{title}</span>
      </figcaption>
    ) : null}
    <CopyButton
      event="copy_primitive_code"
      value={code}
      className={copyButtonClassName}
    />
    <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  </figure>
);
