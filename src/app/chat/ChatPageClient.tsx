"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";

export function ChatPageClient() {
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      <ChatContainer className="flex-1" />
    </div>
  );
}
