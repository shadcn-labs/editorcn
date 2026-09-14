"use client";

import { ChatInputPreview } from "@/components/chat-input-preview";

export const FloatingMenuPage = () => (
  <div className="container mx-auto max-w-3xl px-4 py-8">
    <h1 className="mb-2 text-2xl font-bold">Floating Menu Test</h1>
    <p className="mb-6 text-sm text-muted-foreground">
      A WhatsApp-style chat input powered by the floating menu package. Type a
      message and select text for formatting options; press Enter with text to
      send.
    </p>
    <ChatInputPreview />
  </div>
);
export default FloatingMenuPage;
