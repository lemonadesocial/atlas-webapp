"use client";

import { ChatProvider } from "@/components/chat/ChatProvider";
import { ChatContainer } from "@/components/chat/ChatContainer";

export function ChatPageClient() {
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      <ChatProvider>
        <ChatContainer className="flex-1" />
      </ChatProvider>
    </div>
  );
}
