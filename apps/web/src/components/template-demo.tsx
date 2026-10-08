"use client";

import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";

import { CommentBox } from "@/components/templates/comment-box";
import { SimpleDocumentEditor } from "@/components/templates/simple-document-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=96&h=96&fit=crop&crop=faces&auto=format&q=80`;

const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const text = (value: string, mark?: string) => ({
  marks: mark ? [{ type: mark }] : undefined,
  text: value,
  type: "text",
});

const doc = (...content: ReturnType<typeof text>[]) => ({
  content: [{ content, type: "paragraph" }],
  type: "doc",
});

const DEMO_COMMENTS = [
  {
    author: {
      avatar: photo("1494790108377-be9c29b29330"),
      id: "maya",
      name: "Maya Lindqvist",
    },
    content: doc(
      text("The new toolbar feels much lighter. Can we get a "),
      text("table shortcut", "bold"),
      text(" in the next release?")
    ),
    createdAt: ago(180),
    id: "c1",
    reactions: [
      { count: 3, emoji: "👍" },
      { count: 1, emoji: "🎉", reacted: true },
    ],
    replies: [
      {
        author: {
          avatar: photo("1500648767791-00dcc994a43e"),
          id: "leo",
          name: "Leo Fischer",
        },
        content: doc(text("+1, tables are the main thing I'm missing.")),
        createdAt: ago(150),
        id: "c1-r1",
        reactions: [{ count: 2, emoji: "👍" }],
      },
      {
        author: {
          avatar: photo("1534528741775-53994a69daeb"),
          id: "you",
          name: "Sofia Martins",
        },
        content: doc(
          text("@Leo Fischer "),
          text("same here", "italic"),
          text(". Happy to help test it.")
        ),
        createdAt: ago(40),
        id: "c1-r2",
      },
    ],
  },
  {
    author: {
      avatar: photo("1507003211169-0a1dd7228f2d"),
      id: "daniel",
      name: "Daniel Ortiz",
    },
    content: doc(
      text("Agreed. I'd also love "),
      text("Mod+Shift+T", "code"),
      text(" to insert a 3×3 table so we skip the dialog.")
    ),
    createdAt: ago(95),
    id: "c2",
    reactions: [{ count: 2, emoji: "👀" }],
  },
  {
    author: {
      avatar: photo("1438761681033-6461ffad8d80"),
      id: "priya",
      name: "Priya Raman",
    },
    content: doc(
      text("Added it to the roadmap. I'll share a draft by "),
      text("Friday", "italic"),
      text(".")
    ),
    createdAt: ago(12),
    id: "c3",
  },
];

const DEMOS = {
  "comment-box": (className?: string) => (
    <CommentBox
      className={className}
      currentUser={{
        avatar: photo("1534528741775-53994a69daeb"),
        id: "you",
        name: "Sofia Martins",
      }}
      initialComments={DEMO_COMMENTS}
    />
  ),
  "simple-document-editor": (className?: string) => (
    <SimpleDocumentEditor
      className={className}
      collaborators={[
        { name: "Ava Thompson", src: photo("1494790108377-be9c29b29330") },
        { name: "Noah Kim", src: photo("1507003211169-0a1dd7228f2d") },
        { name: "Lena Novak", src: photo("1438761681033-6461ffad8d80") },
      ]}
      onShare={async () => {
        try {
          await navigator.clipboard.writeText(globalThis.location.href);
          toast.success("Link copied");
        } catch {
          toast.error("Couldn't copy the link");
        }
      }}
    />
  ),
};

export type TemplateName = keyof typeof DEMOS;

export const TemplateDemo = ({
  className,
  name,
}: {
  className?: string;
  name: string;
}) =>
  Object.hasOwn(DEMOS, name)
    ? DEMOS[name as TemplateName](className)
    : notFound();

export const TemplateTabs = ({
  code,
  name,
}: {
  code: React.ReactNode;
  name: TemplateName;
}) => (
  <Tabs defaultValue="preview" className="mt-6">
    <div className="flex items-center justify-between gap-2">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <Button asChild size="sm" variant="ghost">
        <Link href={`/preview/${name}`} target="_blank">
          <ExternalLinkIcon />
          Open in new tab
        </Link>
      </Button>
    </div>
    <TabsContent value="preview" className="pt-4">
      <div className="bg-muted/30 rounded-xl border p-4 sm:p-8">
        {DEMOS[name]()}
      </div>
    </TabsContent>
    <TabsContent value="code" className="pt-4">
      {code}
    </TabsContent>
  </Tabs>
);
