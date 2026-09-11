"use client";

import { ChatInputPreview } from "@/components/chat-input-preview";
import { FloatingMenuPreview } from "@/components/floating-menu-preview";

export const FloatingMenuPage = () => (
  <div className="container mx-auto max-w-3xl px-4 py-8">
    <h1 className="mb-2 text-2xl font-bold">Floating Menu Test</h1>
    <p className="mb-6 text-sm text-muted-foreground">
      Click an empty line — the new floating menu appears on the same line,
      right after the cursor. Type and it disappears. Select text — the existing
      bubble menu appears above the selection.
    </p>
    <FloatingMenuPreview />
    <h2 className="mt-10 mb-2 text-xl font-bold">Chat input usage</h2>
    <p className="mb-6 text-sm text-muted-foreground">
      The same menu package powers a WhatsApp-style chat input. Press Enter on
      an empty line for block actions; select text for formatting; press Enter
      with text to send.
    </p>
    <ChatInputPreview />
  </div>
);
export default FloatingMenuPage;
