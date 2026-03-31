"use client";

import { memo } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { ToolIndicator } from "./ToolIndicator";
import { ChatEventCard } from "./ChatEventCard";
import { escapeHtml } from "@/lib/utils/escape";

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderContent(content: string): React.ReactNode {
  if (!content) return null;

  // Split on double newlines for paragraphs, render with escaped HTML
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.map((p, i) => {
    const lines = p.split("\n");
    return (
      <p key={i} className="whitespace-pre-wrap break-words">
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {escapeHtml(line)}
          </span>
        ))}
      </p>
    );
  });
}

export const ChatMessageComponent = memo(function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-accent text-white"
            : "bg-card border border-divider text-primary"
        }`}
      >
        {/* Tool execution indicators */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <ToolIndicator tools={message.toolCalls} />
        )}

        {/* Text content */}
        {message.content && (
          <div className="flex flex-col gap-2 text-sm leading-relaxed">
            {renderContent(message.content)}
          </div>
        )}

        {/* Streaming cursor */}
        {message.isStreaming && !message.content && (
          <div className="flex items-center gap-1 py-1" aria-label="Thinking">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary [animation-delay:300ms]" />
          </div>
        )}

        {/* Inline event cards */}
        {!isUser && message.events && message.events.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {message.events.map((event) => (
              <ChatEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
