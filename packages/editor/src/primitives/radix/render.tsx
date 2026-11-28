import { cloneElement } from "react";
import type { ReactElement, ReactNode } from "react";

interface RenderProps {
  render?: ReactElement;
  children?: ReactNode;
}

const withRender = ({ render, children }: RenderProps) => {
  if (!render) {
    return { asChild: false, children };
  }
  return {
    asChild: true,
    children:
      children === undefined
        ? render
        : cloneElement(render, undefined, children),
  };
};

export { withRender };
export type { RenderProps };
