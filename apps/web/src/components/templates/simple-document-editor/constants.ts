import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";

import type { DocumentCollaborator } from "./types";

export const SAMPLE_CONTENT = `
<p>We're rebuilding the first-run experience so new teams reach their first shared document in under <mark>two minutes</mark>. This page tracks scope, decisions and open questions.</p>
<h2>Goals</h2>
<ul>
  <li><p>Cut the setup flow from seven steps to three</p></li>
  <li><p>Invite teammates before the first document is created</p></li>
  <li><p>Replace the empty state with three starter templates</p></li>
</ul>
<h2>Milestones</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Interview twelve teams who churned in week one</p></li>
  <li data-type="taskItem" data-checked="true"><p>Prototype the three-step flow</p></li>
  <li data-type="taskItem" data-checked="false"><p>Usability test with <strong>five</strong> new teams</p></li>
  <li data-type="taskItem" data-checked="false"><p>Ship behind the <code>onboarding-v2</code> flag</p></li>
</ul>
<blockquote><p>"I didn't know what to write first, so I closed the tab."</p></blockquote>
<h2>Open questions</h2>
<p>Should templates be picked by role or by use case? Research leans towards use case, but sales wants role-based starters for enterprise trials.</p>
`;

export const SAMPLE_COLLABORATORS: DocumentCollaborator[] = [
  { name: "Ava Thompson" },
  { name: "Noah Kim" },
  { name: "Lena Novak" },
];

export const TEXT_STYLES = [
  { className: "", label: "Paragraph", value: "0" },
  { className: "font-bold", label: "Heading 1", value: "1" },
  { className: "font-semibold", label: "Heading 2", value: "2" },
  { className: "font-medium", label: "Heading 3", value: "3" },
] as const;

export const ALIGNMENTS = [
  { Icon: AlignLeft, label: "Left", value: "left" },
  { Icon: AlignCenter, label: "Center", value: "center" },
  { Icon: AlignRight, label: "Right", value: "right" },
  { Icon: AlignJustify, label: "Justify", value: "justify" },
] as const;

export const FONTS = [
  { label: "Sans", value: "" },
  { label: "Serif", value: "ui-serif, Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
] as const;

export const TEXT_COLORS = [
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#9333ea" },
];

export const HIGHLIGHTS = [
  { label: "Yellow highlight", value: "rgb(250 204 21 / 0.4)" },
  { label: "Green highlight", value: "rgb(74 222 128 / 0.35)" },
  { label: "Blue highlight", value: "rgb(96 165 250 / 0.35)" },
  { label: "Pink highlight", value: "rgb(244 114 182 / 0.35)" },
  { label: "Purple highlight", value: "rgb(192 132 252 / 0.35)" },
];

export const SHORTCUTS = [
  {
    items: [
      ["Bold", "Mod+B"],
      ["Italic", "Mod+I"],
      ["Underline", "Mod+U"],
      ["Strikethrough", "Mod+Shift+S"],
      ["Inline code", "Mod+E"],
      ["Highlight", "Mod+Shift+H"],
      ["Superscript", "Mod+."],
      ["Subscript", "Mod+,"],
      ["Link", "Mod+K"],
      ["Heading 1 to 3", "Mod+Alt+1"],
      ["Task list", "Mod+Shift+9"],
      ["Indent", "Tab"],
    ],
    title: "Formatting",
  },
  {
    items: [
      ["Heading", "#"],
      ["Bullet list", "-"],
      ["Numbered list", "1."],
      ["Task list", "[ ]"],
      ["Quote", ">"],
      ["Code block", "```"],
      ["Divider", "---"],
    ],
    title: "Markdown",
  },
] as const;

export const SCROLLBAR =
  "[scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent";

export const CANVAS =
  "bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))]!";

export const SCROLL_SHADOWS = {
  background: [
    "linear-gradient(to right, var(--background) 30%, transparent) left / 2.5rem 100% no-repeat local",
    "linear-gradient(to left, var(--background) 30%, transparent) right / 2.5rem 100% no-repeat local",
    "radial-gradient(farthest-side at 0 50%, rgb(0 0 0 / 0.14), transparent) left / 0.75rem 100% no-repeat scroll",
    "radial-gradient(farthest-side at 100% 50%, rgb(0 0 0 / 0.14), transparent) right / 0.75rem 100% no-repeat scroll",
    "var(--background)",
  ].join(", "),
};

export const ACTIVE_ITEM =
  "rounded-md py-1 pl-2 text-[13px] data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-checked:bg-accent data-checked:text-accent-foreground [&>span:first-child]:hidden [&_svg:not([class*='size-'])]:size-3.5";
