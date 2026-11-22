import { aliases } from "./config.ts";
import { isScript, scanImports } from "./imports.ts";

export const workspacePrefix = "@editorcn/";

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

const wildcardAliases = Object.entries(aliases)
  .filter(([key]) => key.includes("*"))
  .flatMap(([key, target]) => {
    const [prefix = "", suffix = ""] = key.split("*");
    return typeof target === "string" ? [{ prefix, suffix, target }] : [];
  })
  .toSorted(
    (a, b) =>
      b.prefix.length - a.prefix.length || b.suffix.length - a.suffix.length
  );

const resolveAlias = (specifier: string) => {
  if (Object.hasOwn(aliases, specifier)) {
    const target = aliases[specifier];
    return typeof target === "string" ? target : target?.["*"];
  }
  const match = wildcardAliases.find(
    ({ prefix, suffix }) =>
      specifier.length >= prefix.length + suffix.length &&
      specifier.startsWith(prefix) &&
      specifier.endsWith(suffix)
  );
  return match?.target.replace(
    "*",
    specifier.slice(match.prefix.length, specifier.length - match.suffix.length)
  );
};

const importedName = (name: string) =>
  name
    .replace(/^type\s+/, "")
    .split(/\s+as\s+/)[0]
    ?.trim();

const splitNamedImports = (
  content: string,
  specifier: string,
  targets: Record<string, string>
) => {
  const order = [
    ...Object.keys(targets).filter((name) => name !== "*"),
    "*",
  ].map((name) => targets[name]);
  const pattern = new RegExp(
    `import(\\s+type)?\\s*\\{([^}]*)\\}\\s*from\\s*(["'])${escapeRegExp(specifier)}\\3(;?)`,
    "g"
  );
  return content.replaceAll(
    pattern,
    (
      statement,
      type: string | undefined,
      names: string,
      quote: string,
      semicolon: string
    ) => {
      const groups = new Map<string | undefined, string[]>();
      for (const name of names
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)) {
        const target = targets[importedName(name) ?? ""] ?? targets["*"];
        groups.set(target, [...(groups.get(target) ?? []), name]);
      }
      if (groups.size === 1) {
        const [target] = groups.keys();
        return statement.replace(
          `${quote}${specifier}${quote}`,
          `${quote}${target}${quote}`
        );
      }
      return [...groups]
        .toSorted(([a], [b]) => order.indexOf(a) - order.indexOf(b))
        .map(
          ([target, list]) =>
            `import${type ?? ""} { ${list.join(", ")} } from ${quote}${target}${quote}${semicolon}`
        )
        .join("\n");
    }
  );
};

const rewriteSpecifiers = (content: string, path: string) => {
  let output = content;
  const workspaceImports = scanImports(content, path)
    .filter(({ specifier }) => specifier.startsWith(workspacePrefix))
    .toReversed();
  for (const { end, specifier, start } of workspaceImports) {
    if (typeof aliases[specifier] === "object") {
      throw new TypeError(
        `${path}: "${specifier}" maps named imports to different files, but this import could not be split. Use \`import { ... } from "${specifier}"\`.`
      );
    }
    const target = resolveAlias(specifier);
    if (!target) {
      throw new Error(
        `${path}: no alias for "${specifier}". Add one to scripts/registry/config.ts.`
      );
    }
    output = `${output.slice(0, start)}${target}${output.slice(end)}`;
  }
  return output;
};

export const transform = (content: string, path: string) => {
  if (!isScript(path)) {
    return content;
  }
  let split = content;
  for (const [specifier, targets] of Object.entries(aliases)) {
    if (typeof targets !== "string") {
      split = splitNamedImports(split, specifier, targets);
    }
  }
  const output = rewriteSpecifiers(split, path);
  const leftover = scanImports(output, path).find(({ specifier }) =>
    specifier.startsWith(workspacePrefix)
  );
  if (leftover) {
    throw new Error(
      `${path}: "${leftover.specifier}" is still a workspace import after rewriting.`
    );
  }
  return output;
};
