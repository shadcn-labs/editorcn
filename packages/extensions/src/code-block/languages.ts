import type { Plugin } from "prettier";

export const CODE_BLOCK_LANGUAGES = [
  { label: "Plain Text", value: "plaintext" },
  { label: "Bash", value: "bash" },
  { label: "C", value: "c" },
  { label: "C#", value: "csharp" },
  { label: "C++", value: "cpp" },
  { label: "Clojure", value: "clojure" },
  { label: "CoffeeScript", value: "coffee" },
  { label: "CSS", value: "css" },
  { label: "Dart", value: "dart" },
  { label: "Diff", value: "diff" },
  { label: "Docker", value: "docker" },
  { label: "Elixir", value: "elixir" },
  { label: "Elm", value: "elm" },
  { label: "Erlang", value: "erlang" },
  { label: "F#", value: "fsharp" },
  { label: "Go", value: "go" },
  { label: "GraphQL", value: "graphql" },
  { label: "Groovy", value: "groovy" },
  { label: "Haskell", value: "haskell" },
  { label: "HCL", value: "hcl" },
  { label: "HTML", value: "html" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "JSX", value: "jsx" },
  { label: "Julia", value: "julia" },
  { label: "Kotlin", value: "kotlin" },
  { label: "LaTeX", value: "latex" },
  { label: "Less", value: "less" },
  { label: "Lua", value: "lua" },
  { label: "Makefile", value: "makefile" },
  { label: "Markdown", value: "markdown" },
  { label: "Mermaid", value: "mermaid" },
  { label: "Nix", value: "nix" },
  { label: "Objective-C", value: "objective-c" },
  { label: "OCaml", value: "ocaml" },
  { label: "Perl", value: "perl" },
  { label: "PHP", value: "php" },
  { label: "PowerShell", value: "powershell" },
  { label: "Prolog", value: "prolog" },
  { label: "Protobuf", value: "proto" },
  { label: "Python", value: "python" },
  { label: "R", value: "r" },
  { label: "Ruby", value: "ruby" },
  { label: "Rust", value: "rust" },
  { label: "Sass", value: "sass" },
  { label: "Scala", value: "scala" },
  { label: "SCSS", value: "scss" },
  { label: "Solidity", value: "solidity" },
  { label: "SQL", value: "sql" },
  { label: "Svelte", value: "svelte" },
  { label: "Swift", value: "swift" },
  { label: "TOML", value: "toml" },
  { label: "TSX", value: "tsx" },
  { label: "TypeScript", value: "typescript" },
  { label: "Vue", value: "vue" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
  { label: "Zig", value: "zig" },
];

export const getLanguageLabel = (value: string) =>
  CODE_BLOCK_LANGUAGES.find((lang) => lang.value === value)?.label ?? value;

const babel = () => [
  import("prettier/plugins/babel"),
  import("prettier/plugins/estree"),
];

const FORMATTERS: Record<
  string,
  { parser: string; plugins: () => Promise<unknown>[] }
> = {
  css: { parser: "css", plugins: () => [import("prettier/plugins/postcss")] },
  graphql: {
    parser: "graphql",
    plugins: () => [import("prettier/plugins/graphql")],
  },
  html: { parser: "html", plugins: () => [import("prettier/plugins/html")] },
  javascript: { parser: "babel", plugins: babel },
  json: { parser: "json", plugins: babel },
  jsx: { parser: "babel", plugins: babel },
  less: { parser: "less", plugins: () => [import("prettier/plugins/postcss")] },
  markdown: {
    parser: "markdown",
    plugins: () => [import("prettier/plugins/markdown")],
  },
  scss: { parser: "scss", plugins: () => [import("prettier/plugins/postcss")] },
  tsx: {
    parser: "typescript",
    plugins: () => [
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
    ],
  },
  typescript: {
    parser: "typescript",
    plugins: () => [
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
    ],
  },
  vue: { parser: "vue", plugins: () => [import("prettier/plugins/html")] },
  yaml: { parser: "yaml", plugins: () => [import("prettier/plugins/yaml")] },
};

export const canFormat = (language: string) => language in FORMATTERS;

export const formatCode = async (code: string, language: string) => {
  const config = FORMATTERS[language];
  if (!config) {
    return code;
  }
  const [{ format }, ...plugins] = await Promise.all([
    import("prettier/standalone"),
    ...config.plugins(),
  ]);
  const formatted = await format(code, {
    parser: config.parser,
    plugins: plugins.map(
      (plugin) => ((plugin as { default?: Plugin }).default ?? plugin) as Plugin
    ),
  });
  return formatted.trimEnd();
};
