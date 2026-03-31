"use client";

import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@/lib/hooks/useChat";
import { ChatMessageComponent } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedPrompts } from "./SuggestedPrompts";

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className = "" }: ChatContainerProps) {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage]
  );

  const isEmpty = messages.length === 0;

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header with clear button */}
      {!isEmpty && (
        <div className="flex items-center justify-end border-b border-divider px-4 py-2">
          <button
            onClick={clearMessages}
            className="text-xs text-secondary transition-colors hover:text-primary"
            aria-label="Clear chat history"
          >
            Clear chat
          </button>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        role="list"
        aria-label="Chat messages"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold text-primary font-display">
                Atlas Chat
              </h2>
              <p className="mt-1 text-sm text-secondary">
                Search events, get recommendations, or manage your events with natural language.
              </p>
            </div>
            <SuggestedPrompts onSelect={handleSend} />
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          className="mx-4 mb-2 rounded-md bg-danger/10 px-3 py-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
