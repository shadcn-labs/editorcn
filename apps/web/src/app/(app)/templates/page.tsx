import type { Metadata } from "next";

import { CodeBlockCommand } from "@/components/code-block-command";
import { ChatComposer } from "@/components/templates/chat-composer";
import { CommentBox } from "@/components/templates/comment-box";
import { DocumentEditor } from "@/components/templates/document-editor";

export const metadata: Metadata = {
  description:
    "Ready-to-use editor templates: chat composer, comment box, and document editor. Live previews with one-command shadcn installs.",
  title: "Templates",
};

const install = (name: string) => ({
  __bun__: `bunx shadcn@latest add "https://editorcn.vercel.app/r/${name}.json"`,
  __npm__: `npx shadcn@latest add "https://editorcn.vercel.app/r/${name}.json"`,
  __pnpm__: `pnpm dlx shadcn@latest add "https://editorcn.vercel.app/r/${name}.json"`,
  __yarn__: `yarn dlx shadcn@latest add "https://editorcn.vercel.app/r/${name}.json"`,
});

const TEMPLATES = [
  {
    description:
      "A chat panel with a compact editor input, message bubbles, and an onSend hook. Pass onSend to wire your backend; without it, messages append locally with a placeholder assistant reply.",
    install: install("chat-composer"),
    preview: <ChatComposer />,
    title: "Chat Composer",
  },
  {
    description:
      "A comment thread with avatar initials, a subtle editor input, and an onPost hook. Seed it with initialComments for existing threads.",
    install: install("comment-box"),
    preview: (
      <CommentBox
        initialComments={[
          {
            author: "Ada Lovelace",
            html: "<p>Love the new toolbar — can we get a table shortcut next?</p>",
            id: "seed-1",
          },
        ]}
      />
    ),
    title: "Comment Box",
  },
  {
    description:
      "A titled document with a full toolbar and an onChange hook that emits HTML on every update.",
    install: install("document-editor"),
    preview: <DocumentEditor />,
    title: "Document Editor",
  },
];

const TemplatesPage = () => (
  <div className="container-wrapper">
    <div className="container flex flex-col gap-10 py-10">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Templates
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Composed editors for common UI — chat, comments, documents. Each is a
          live preview below and installs as a shadcn block with one command.
          Blocks depend on the editor component, which the CLI installs
          automatically.
        </p>
      </div>
      {TEMPLATES.map((template) => (
        <section key={template.title} className="flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-xl font-medium tracking-tight">
              {template.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {template.description}
            </p>
          </div>
          {template.preview}
          <CodeBlockCommand {...template.install} />
        </section>
      ))}
    </div>
  </div>
);

export default TemplatesPage;
