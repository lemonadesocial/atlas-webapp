"use client";

import type { ToolCall } from "@/lib/types/chat";

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  event_search: "Searching events",
  event_create: "Creating event",
  event_get: "Loading event details",
  event_list: "Loading events",
  event_update: "Updating event",
  get_me: "Loading profile",
  space_list: "Loading spaces",
  space_switch: "Switching space",
  space_create: "Creating space",
  tickets_create_type: "Creating ticket type",
  event_guests: "Loading guest list",
  event_guest_stats: "Loading guest stats",
  event_ticket_sold_insight: "Loading ticket sales",
  connect_platform: "Connecting platform",
};

function getToolLabel(tool: ToolCall): string {
  if (tool.displayName && tool.displayName !== tool.name) {
    return tool.displayName;
  }
  return TOOL_DISPLAY_NAMES[tool.name] || tool.name.replace(/_/g, " ");
}

interface ToolIndicatorProps {
  tools: ToolCall[];
}

export function ToolIndicator({ tools }: ToolIndicatorProps) {
  if (!tools.length) return null;

  return (
    <div className="flex flex-col gap-1 py-1" role="status" aria-live="polite">
      {tools.map((tool) => (
        <div key={tool.id} className="flex items-center gap-2 text-xs text-secondary">
          {tool.status === "running" ? (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          ) : tool.status === "complete" ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-success"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-danger"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          <span>{getToolLabel(tool)}</span>
        </div>
      ))}
    </div>
  );
}
