import { CommandBox } from "@/components/command-box";
import { EditorSection } from "@/components/editor-section";
import { HomeCtas } from "@/components/home-ctas";
import { HomeCustomize } from "@/components/home-customize";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

const editorCode = `import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { RichTextEditor, Link, YouTubeEmbed, TwitterEmbed, CodeBlock } from "@/components/editor";
import { Table } from "@/components/extensions/table";
import { TableToolbar } from "@/components/extensions/table-toolbar";
import { TableHoverOverlay } from "@/components/extensions/table-hover-overlay";
import { ResizableImage, ImagePlaceholder } from "@/components/extensions/image-placeholder";
import { ImagePlaceholderToolbar } from "@/components/extensions/image-placeholder-toolbar";
import "@/components/editor/style.css";
import "@/components/extensions/table/style.css";
import "@/components/extensions/image-placeholder/style.css";
import "@/components/extensions/ui/style.css";

export function MyEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      Link,
      YouTubeEmbed,
      TwitterEmbed,
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start typing..." }),
      CodeBlock,
      Table.configure({ resizable: true }),
      ResizableImage,
      ImagePlaceholder,
    ],
  });

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar sticky>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.Code />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
          <RichTextEditor.H5 />
          <RichTextEditor.H6 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignRight />
          <RichTextEditor.AlignJustify />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Highlight />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
          <RichTextEditor.CodeBlock />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.YouTubeEmbed />
          <RichTextEditor.TwitterEmbed />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <ImagePlaceholderToolbar editor={editor} />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <TableToolbar editor={editor} />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
      <TableHoverOverlay editor={editor} />
    </RichTextEditor>
  );
}`;

const blockEditorCode = `import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import { GripVerticalIcon } from "lucide-react";
import { Table } from "@/components/extensions/table";
import { TableHoverOverlay } from "@/components/extensions/table-hover-overlay";
import { ResizableImage, ImagePlaceholder } from "@/components/extensions/image-placeholder";
import {
  BlockEditor,
  SlashCommand,
  CodeBlock,
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "@/components/block-editor";
import type { SlashCommandSuggestionItem } from "@/components/block-editor";
import "@/components/block-editor/style.css";
import "@/components/extensions/table/style.css";
import "@/components/extensions/image-placeholder/style.css";
import "@/components/extensions/ui/style.css";

const DEMO_CONTENT = "<h2>Getting Started</h2><p>The BlockEditor is a block-style editor.</p>";

const myItems: SlashCommandSuggestionItem[] = [
  ...defaultSlashCommandItems,
  {
    id: "image",
    title: "Image",
    description: "Insert an image placeholder you can fill in.",
    keywords: ["image", "img", "picture", "photo"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertImagePlaceholder().run();
    },
  },
  {
    id: "table",
    title: "Table",
    description: "Insert a table.",
    keywords: ["table", "grid"],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    command: ({ editor, range }) => {
      editor
        .chain().focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
];

export function MyBlockEditor() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3], codeBlock: false } }),
      Placeholder.configure({ placeholder: "Type / for commands..." }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      ResizableImage,
      ImagePlaceholder,
      SlashCommand.configure({ suggestion: getSlashCommandSuggestion(myItems) }),
      CodeBlock,
      Link.configure({ openOnClick: true, autolink: true, defaultProtocol: "https", protocols: ["http", "https"] }),
    ],
    content: DEMO_CONTENT,
  });

  return (
    <>
      <BlockEditor
        editor={editor}
        icons={{
          dragHandleIcon: <GripVerticalIcon className="h-4 w-4" />,
          boldIcon: <strong>B</strong>,
        }}
      />
      <TableHoverOverlay editor={editor} />
    </>
  );
}`;

const editorCodeData = [
  {
    code: editorCode,
    filename: "editor.tsx",
    language: "tsx",
  },
];

const blockEditorCodeData = [
  {
    code: blockEditorCode,
    filename: "block-editor.tsx",
    language: "tsx",
  },
];

export const HomePage = () => (
  <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <PageHero
            description={
              <>
                Ready to use, customizable rich text editor components for
                React.
                <br className="hidden sm:block" />
                Built on Tiptap. Distributed via shadcn.
              </>
            }
            descriptionClassName="max-w-2xl text-lg sm:text-xl"
            title="Beautiful rich text editors, made simple"
            titleClassName="max-w-7xl"
          />

          <CommandBox className="mt-4 w-full max-w-xl" />

          <HomeCtas />
        </div>
      </section>

      <section className="container-wrapper">
        <div className="container space-y-12">
          <EditorSection
            type="editor"
            title="Rich Text Editor"
            badge="Toolbar"
            description="A traditional toolbar-style rich text editor. 20+ built-in controls including text formatting, headings, lists, links, alignment, and history."
            codeData={editorCodeData}
            docsHref="/docs/editor"
          />

          <EditorSection
            type="block-editor"
            title="Block Editor"
            badge="Blocks"
            badgeClass="inline-flex h-5 items-center rounded-full bg-primary px-2 text-[11px] font-medium tracking-wider text-primary-foreground"
            description="A Notion-style block-based editor with slash commands, drag handles, and a bubble menu. Supports images, tables, code blocks, and task lists."
            codeData={blockEditorCodeData}
            docsHref="/docs/block-editor"
          />
        </div>
      </section>

      <section className="container-wrapper">
        <HomeCustomize className="container py-16 md:py-20 lg:py-24" />
      </section>
    </PageTransition>
  </>
);
export default HomePage;
