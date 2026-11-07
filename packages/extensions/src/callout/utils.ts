import type { Node as PMNode } from "@tiptap/pm/model";
import type { Transaction } from "@tiptap/pm/state";
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

export const toCalloutVariant = (value: unknown): CalloutVariant =>
  VARIANT_BY_ALERT[String(value).toLowerCase()] ?? "info";

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
