"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types/chat";

const MAX_MESSAGES = 100;
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_HTTP || "";
const AI_CONFIG = process.env.NEXT_PUBLIC_AI_CONFIG || "";

let nextId = 1;
function generateId(): string {
  return `msg_${Date.now()}_${nextId++}`;
}

function trimMessages(msgs: ChatMessage[]): ChatMessage[] {
  if (msgs.length <= MAX_MESSAGES) return msgs;
  return msgs.slice(msgs.length - MAX_MESSAGES);
}

interface UseChatOptions {
  sessionId?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
}

const RUN_MUTATION = `
  mutation RunAIChat($message: String!, $config: ObjectId!, $session: String, $data: JSON) {
    run(message: $message, config: $config, session: $session, data: $data) {
      message
      sourceDocuments
      metadata
    }
  }
`;

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef(options.sessionId || `session_${Date.now()}`);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (!AI_API_URL || !AI_CONFIG) {
      setError("Chat is not available yet");
      return;
    }

    setError(null);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    const assistantId = generateId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages((prev) => trimMessages([...prev, userMessage, assistantMessage]));
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: RUN_MUTATION,
          variables: {
            message: content.trim(),
            config: AI_CONFIG,
            session: sessionIdRef.current,
            data: {},
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Chat request failed (${res.status})`);
      }

      const json = await res.json();

      if (json.errors?.length) {
        throw new Error(json.errors[0].message || "Chat request failed");
      }

      const reply = json.data?.run?.message || "No response";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: reply, isStreaming: false }
            : msg
        )
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: message, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionIdRef.current = `session_${Date.now()}`;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    sessionId: sessionIdRef.current,
  };
}
