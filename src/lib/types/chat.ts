import type { AtlasEvent } from "./atlas";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  events?: AtlasEvent[];
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  displayName: string;
  status: "running" | "complete" | "error";
  result?: string;
}

/** SSE event types from the lemonade-ai chat endpoint */
export type StreamEventType = "text_delta" | "tool_start" | "tool_end" | "event_results" | "done" | "error";

export interface StreamEvent {
  type: StreamEventType;
  /** Incremental text for text_delta */
  text?: string;
  /** Tool info for tool_start/tool_end */
  tool?: {
    id: string;
    name: string;
    displayName?: string;
  };
  /** Tool result for tool_end */
  result?: string;
  /** Event search results for event_results */
  events?: AtlasEvent[];
  /** Error message for error events */
  error?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface SuggestedPrompt {
  label: string;
  prompt: string;
}
