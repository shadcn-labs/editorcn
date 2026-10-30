"use client";

import {
  copyMarkdown,
  downloadMarkdown,
  importMarkdownFile,
} from "@editorcn/extensions/markdown";
import type { Editor } from "@tiptap/react";
import { Copy, FileDown, FileUp, MoreHorizontal, Printer } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { DocumentCollaborator } from "./types";
import { initials } from "./utils";

export const Collaborators = ({
  people,
}: {
  people: DocumentCollaborator[];
}) => (
  <div className="flex -space-x-1.5">
    {people.map((person) => (
      <Tooltip key={person.name}>
        <TooltipTrigger asChild>
          <Avatar className="ring-background size-6 ring-2">
            {person.src && <AvatarImage alt={person.name} src={person.src} />}
            <AvatarFallback className="text-[0.6rem] font-medium">
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>{person.name}</TooltipContent>
      </Tooltip>
    ))}
  </div>
);

const ITEM = "rounded-md py-1 text-[13px] [&_svg]:size-3.5!";

const toFilename = (title: string) =>
  `${title.trim().replaceAll(/[^\w-]+/g, "-") || "untitled"}.md`;

export const MoreMenu = ({
  editor,
  title,
}: {
  editor: Editor | null;
  title: string;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        aria-label="More options"
        className="text-muted-foreground size-7"
        size="icon-sm"
        variant="ghost"
      >
        <MoreHorizontal />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="min-w-44 p-1">
      <DropdownMenuItem
        className={ITEM}
        disabled={!editor}
        onClick={() => editor && importMarkdownFile(editor)}
      >
        <FileUp />
        Import Markdown
      </DropdownMenuItem>
      <DropdownMenuItem
        className={ITEM}
        disabled={!editor}
        onClick={() => editor && downloadMarkdown(editor, toFilename(title))}
      >
        <FileDown />
        Export Markdown
      </DropdownMenuItem>
      <DropdownMenuItem
        className={ITEM}
        disabled={!editor}
        onClick={() => editor && copyMarkdown(editor)}
      >
        <Copy />
        Copy as Markdown
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className={ITEM}
        onClick={() => navigator.clipboard.writeText(editor?.getHTML() ?? "")}
      >
        <Copy />
        Copy as HTML
      </DropdownMenuItem>
      <DropdownMenuItem className={ITEM} onClick={() => window.print()}>
        <Printer />
        Print
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
