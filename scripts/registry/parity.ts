import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import ts from "typescript";

import { primitivePairs, stateSelectors } from "./config.ts";
import { readText, root } from "./discover.ts";
import { scanImports } from "./imports.ts";

const classCalls = new Set(["cn", "cva", "clsx"]);

const normalize = (token: string) => {
  let output = token;
  for (const [pattern, replacement] of stateSelectors) {
    output = output.replaceAll(pattern, replacement);
  }
  return output;
};

const componentName = (statement: ts.Statement) => {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations[0]?.name.getText();
  }
  if (ts.isFunctionDeclaration(statement)) {
    return statement.name?.text;
  }
};

const classesByComponent = (path: string) => {
  const file = ts.createSourceFile(
    path,
    readText(path),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const constants = new Map<string, ts.Expression>();
  for (const statement of file.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer &&
          !ts.isCallExpression(declaration.initializer)
        ) {
          constants.set(declaration.name.text, declaration.initializer);
        }
      }
    }
  }
  const classes = new Map<string, Set<string>>();
  const collect = (owner: string, node: ts.Node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const set = classes.get(owner) ?? new Set();
      for (const token of node.text.split(/\s+/).filter(Boolean)) {
        set.add(normalize(token));
      }
      classes.set(owner, set);
      return;
    }
    if (ts.isIdentifier(node)) {
      const value = constants.get(node.text);
      if (value) {
        collect(owner, value);
      }
      return;
    }
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText() === "defaultVariants"
    ) {
      return;
    }
    ts.forEachChild(node, (child) => collect(owner, child));
  };
  const visit = (owner: string, node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText() === "className") {
      const tag = node.parent.parent.tagName.getText();
      if (!tag.endsWith(".Positioner") && node.initializer) {
        collect(owner, node.initializer);
      }
      return;
    }
    if (
      ts.isCallExpression(node) &&
      classCalls.has(node.expression.getText())
    ) {
      collect(owner, node);
      return;
    }
    ts.forEachChild(node, (child) => visit(owner, child));
  };
  for (const statement of file.statements) {
    const name = componentName(statement);
    if (name) {
      visit(name, statement);
    }
  }
  return classes;
};

const difference = (a: Set<string>, b: Set<string>) =>
  [...a].filter((token) => !b.has(token));

const comparePair = (name: string, basePath: string, variantPath: string) => {
  const errors: string[] = [];
  const base = classesByComponent(basePath);
  const variant = classesByComponent(variantPath);
  const allBase = new Set([...base.values()].flatMap((set) => [...set]));
  const allVariant = new Set([...variant.values()].flatMap((set) => [...set]));
  for (const component of new Set([...base.keys(), ...variant.keys()])) {
    const left = base.get(component);
    const right = variant.get(component);
    const missing = right
      ? difference(left ?? new Set(), right)
      : difference(left ?? new Set(), allVariant);
    const extra = left
      ? difference(right ?? new Set(), left)
      : difference(right ?? new Set(), allBase);
    if (missing.length > 0 || extra.length > 0) {
      errors.push(
        `${name} ${component}: classes differ between bases after normalising state selectors.${missing.length > 0 ? ` Only in base: ${missing.join(" ")}.` : ""}${extra.length > 0 ? ` Only in the variant: ${extra.join(" ")}.` : ""}`
      );
    }
  }
  return errors;
};

const importsBase = (path: string) =>
  scanImports(readText(path), path).some(({ specifier }) =>
    primitivePairs.baseImport.test(specifier)
  );

export const checkPrimitiveParity = () => {
  const baseDir = resolve(root, primitivePairs.base);
  const errors: string[] = [];
  const primitives = readdirSync(baseDir).filter(
    (file) => file.endsWith(".tsx") && importsBase(join(baseDir, file))
  );
  for (const [variantName, dir] of Object.entries(primitivePairs.variants)) {
    const variantDir = resolve(root, dir);
    if (!existsSync(variantDir)) {
      errors.push(
        `${variantName}: ${dir} is configured in primitivePairs but does not exist.`
      );
      continue;
    }
    for (const file of primitives) {
      const variantPath = join(variantDir, file);
      if (existsSync(variantPath)) {
        errors.push(
          ...comparePair(
            `${variantName}/${file}`,
            join(baseDir, file),
            variantPath
          )
        );
      } else {
        errors.push(
          `${variantName}/${file}: ${primitivePairs.base}/${file} is a primitive with no ${variantName} twin. Add ${dir}/${file} with the same exports.`
        );
      }
    }
  }
  return errors;
};
