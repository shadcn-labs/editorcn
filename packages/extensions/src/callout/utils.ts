import { findParentNode } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import type { Selection, Transaction } from "@tiptap/pm/state";
import { liftTarget } from "@tiptap/pm/transform";

export const CALLOUT_VARIANTS = [
  "info",
  "tip",
  "warning",
  "danger",
  "note",
] as const;

export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export interface CalloutAttributes {
  emoji?: string | null;
  variant?: CalloutVariant;
}

export const ALERT_BY_VARIANT: Record<CalloutVariant, string> = {
  danger: "CAUTION",
  info: "IMPORTANT",
  note: "NOTE",
  tip: "TIP",
  warning: "WARNING",
};

export const VARIANT_BY_ALERT: Record<string, CalloutVariant> = {
  caution: "danger",
  danger: "danger",
  important: "info",
  info: "info",
  note: "note",
  tip: "tip",
  warning: "warning",
};

export const isCalloutVariant = (value: unknown): value is CalloutVariant =>
  CALLOUT_VARIANTS.includes(value as CalloutVariant);

export const alertToVariant = (value: unknown): CalloutVariant | null => {
  const key = String(value).toLowerCase();
  return Object.hasOwn(VARIANT_BY_ALERT, key)
    ? (VARIANT_BY_ALERT[key] ?? null)
    : null;
};

export const toCalloutVariant = (value: unknown): CalloutVariant =>
  alertToVariant(value) ?? "info";

export const findCallout = (selection: Selection, name: string) => {
  if (selection instanceof NodeSelection && selection.node.type.name === name) {
    return { node: selection.node, pos: selection.from };
  }
  return findParentNode((node) => node.type.name === name)(selection) ?? null;
};

export const unwrapCallout = (tr: Transaction, pos: number, node: PMNode) => {
  const range = tr.doc
    .resolve(pos + 1)
    .blockRange(tr.doc.resolve(pos + node.nodeSize - 1));
  const target = range && liftTarget(range);
  if (!range || target === null || target === undefined) {
    return false;
  }
  tr.lift(range, target);
  return true;
};
