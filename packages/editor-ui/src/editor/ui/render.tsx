"use client";

import * as React from "react";

type UnknownProps = Record<string, unknown>;

export type RenderElement = React.ReactElement | undefined;

export type MergePrecedence = "child" | "own";

const CHAINED_EVENTS = [
  "onClick",
  "onMouseDown",
  "onPointerDown",
  "onKeyDown",
] as const;

export const composeRefs = (
  ...refs: (React.Ref<HTMLElement> | undefined)[]
): React.Ref<HTMLElement> | undefined => {
  const present = refs.filter((ref): ref is React.Ref<HTMLElement> =>
    Boolean(ref)
  );
  if (present.length === 0) {
    return undefined;
  }
  if (present.length === 1) {
    return present[0];
  }
  return (node) => {
    for (const ref of present) {
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as React.RefObject<HTMLElement | null>).current = node;
      }
    }
  };
};

const chainHandlers = (childHandler: unknown, ownHandler: unknown): unknown => {
  if (typeof childHandler !== "function" && typeof ownHandler !== "function") {
    return ownHandler;
  }
  return (...args: unknown[]) => {
    (childHandler as (...a: unknown[]) => void)?.(...args);
    (ownHandler as (...a: unknown[]) => void)?.(...args);
  };
};

export const resolveChildRef = (
  element: RenderElement
): React.Ref<HTMLElement> | undefined => {
  if (!element) {
    return undefined;
  }
  const props = (element.props ?? {}) as UnknownProps;
  return (props.ref ?? (element as { ref?: React.Ref<HTMLElement> }).ref) as
    | React.Ref<HTMLElement>
    | undefined;
};

export interface RenderPrimitiveOptions {
  fallbackType: React.ElementType;
  ownProps: UnknownProps;
  ownRef?: React.Ref<HTMLElement>;
  precedence?: MergePrecedence;
  render?: RenderElement;
}

export const renderPrimitive = ({
  fallbackType: Fallback,
  ownProps,
  ownRef,
  precedence = "child",
  render,
}: RenderPrimitiveOptions): React.ReactElement => {
  if (!render) {
    return <Fallback ref={ownRef} {...ownProps} />;
  }

  const childProps = (render.props ?? {}) as UnknownProps;
  const merged: UnknownProps =
    precedence === "child"
      ? { ...ownProps, ...childProps }
      : { ...childProps, ...ownProps };

  for (const name of CHAINED_EVENTS) {
    if (typeof childProps[name] === "function") {
      merged[name] = chainHandlers(childProps[name], ownProps[name]);
    }
  }

  const ref = composeRefs(resolveChildRef(render), ownRef);
  if (ref) {
    merged.ref = ref;
  }

  return React.cloneElement(render, merged);
};
