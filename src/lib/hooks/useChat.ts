"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage, StreamEvent, ToolCall } from "@/lib/types/chat";
import type { AtlasEvent } from "@/lib/types/atlas";

let nextId = 1;
function generateId(): string {
  return `msg_${Date.now()}_${nextId++}`;
}

function parseSSELine(line: string): StreamEvent | null {
  if (!line.startsWith("data: ")) return null;
  const data = line.slice(6);
  if (data === "[DONE]") return { type: "done" };
  try {
    return JSON.parse(data) as StreamEvent;
  } catch {
    return null;
  }
}

export function parseSSEStream(chunk: string): StreamEvent[] {
  const events: StreamEvent[] = [];
  const lines = chunk.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const event = parseSSELine(trimmed);
    if (event) events.push(event);
  }
  return events;
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

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef(options.sessionId || `session_${Date.now()}`);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

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
      toolCalls: [],
      events: [],
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          session_id: sessionIdRef.current,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || `Chat request failed (${res.status})`
        );
      }

      if (!res.body) {
        throw new Error("No response stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let accumulatedTools: ToolCall[] = [];
      let accumulatedEvents: AtlasEvent[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = parseSSEStream(chunk);

        for (const event of events) {
          switch (event.type) {
            case "text_delta":
              if (event.text) {
                accumulatedText += event.text;
              }
              break;

            case "tool_start":
              if (event.tool) {
                accumulatedTools = [
                  ...accumulatedTools,
                  {
                    id: event.tool.id,
                    name: event.tool.name,
                    displayName: event.tool.displayName || event.tool.name,
                    status: "running",
                  },
                ];
              }
              break;

            case "tool_end":
              if (event.tool) {
                accumulatedTools = accumulatedTools.map((t) =>
                  t.id === event.tool!.id
                    ? { ...t, status: "complete" as const, result: event.result }
                    : t
                );
              }
              break;

            case "event_results":
              if (event.events) {
                accumulatedEvents = [...accumulatedEvents, ...event.events];
              }
              break;

            case "error":
              setError(event.error || "An error occurred");
              break;

            case "done":
              break;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: accumulatedText,
                    toolCalls: accumulatedTools,
                    events: accumulatedEvents,
                    isStreaming: event.type !== "done",
                  }
                : msg
            )
          );
        }
      }

      // Finalize message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Failed to send message";
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
