import { createPageMetadata } from "@/seo/metadata";

export const metadata = createPageMetadata({
  noIndex: true,
  path: "/block-editor",
  title: "Block Editor Demo",
});

const BlockEditorLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default BlockEditorLayout;
