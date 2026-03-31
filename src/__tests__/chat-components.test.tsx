import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock next modules
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, unoptimized, ...rest } = props;
    void fill; void priority; void unoptimized;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { ChatMessageComponent } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatEventCard } from "@/components/chat/ChatEventCard";
import { ToolIndicator } from "@/components/chat/ToolIndicator";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import type { ChatMessage, ToolCall } from "@/lib/types/chat";
import type { AtlasEvent } from "@/lib/types/atlas";

describe("ChatMessageComponent", () => {
  it("renders user message", () => {
    const msg: ChatMessage = {
      id: "1",
      role: "user",
      content: "Find events",
      timestamp: Date.now(),
    };
    render(<ChatMessageComponent message={msg} />);
    expect(screen.getByText("Find events")).toBeTruthy();
  });

  it("renders assistant message", () => {
    const msg: ChatMessage = {
      id: "2",
      role: "assistant",
      content: "Here are some events",
      timestamp: Date.now(),
    };
    render(<ChatMessageComponent message={msg} />);
    expect(screen.getByText("Here are some events")).toBeTruthy();
  });

  it("shows streaming dots when streaming with no content", () => {
    const msg: ChatMessage = {
      id: "3",
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };
    render(<ChatMessageComponent message={msg} />);
    expect(screen.getByLabelText("Thinking")).toBeTruthy();
  });

  it("renders inline event cards", () => {
    const event: AtlasEvent = {
      id: "e1",
      title: "Test Concert",
      description: "",
      start: "2026-04-01T20:00:00Z",
      source_platform: "lemonade",
      city: "Berlin",
    };
    const msg: ChatMessage = {
      id: "4",
      role: "assistant",
      content: "Found this:",
      timestamp: Date.now(),
      events: [event],
    };
    render(<ChatMessageComponent message={msg} />);
    expect(screen.getByText("Test Concert")).toBeTruthy();
  });

  it("escapes HTML in content", () => {
    const msg: ChatMessage = {
      id: "5",
      role: "assistant",
      content: '<script>alert("xss")</script>',
      timestamp: Date.now(),
    };
    const { container } = render(<ChatMessageComponent message={msg} />);
    // Should not contain actual script tags
    expect(container.querySelector("script")).toBeNull();
    // Should contain escaped text
    expect(container.textContent).toContain("&lt;script&gt;");
  });
});

describe("ChatInput", () => {
  it("calls onSend when Enter is pressed", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText("Chat message input");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("hello");
  });

  it("does not send on Shift+Enter", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText("Chat message input");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables input when disabled prop is set", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled />);
    const input = screen.getByLabelText("Chat message input") as HTMLTextAreaElement;
    expect(input.disabled).toBe(true);
  });

  it("does not send empty messages", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const button = screen.getByLabelText("Send message");
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears input after sending", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByLabelText("Chat message input") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });
});

describe("ChatEventCard", () => {
  it("renders event details", () => {
    const event: AtlasEvent = {
      id: "e1",
      title: "Night Market",
      description: "",
      start: "2026-04-05T18:00:00Z",
      city: "NYC",
      source_platform: "eventbrite",
      min_price: 10,
      currency: "USD",
    };
    render(<ChatEventCard event={event} />);
    expect(screen.getByText("Night Market")).toBeTruthy();
    expect(screen.getByText("NYC")).toBeTruthy();
    expect(screen.getByText("eventbrite")).toBeTruthy();
  });

  it("links to /events/[id] for lemonade events", () => {
    const event: AtlasEvent = {
      id: "e2",
      title: "Local Show",
      description: "",
      start: "2026-04-01T20:00:00Z",
      source_platform: "lemonade",
    };
    render(<ChatEventCard event={event} />);
    const link = screen.getByLabelText("View Local Show") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/events/e2");
  });

  it("links externally for non-lemonade events with url", () => {
    const event: AtlasEvent = {
      id: "e3",
      title: "External Gig",
      description: "",
      start: "2026-04-01T20:00:00Z",
      source_platform: "eventbrite",
      url: "https://eventbrite.com/e/123",
    };
    render(<ChatEventCard event={event} />);
    const link = screen.getByLabelText(
      "View External Gig on eventbrite"
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://eventbrite.com/e/123");
    expect(link.getAttribute("target")).toBe("_blank");
  });
});

describe("ToolIndicator", () => {
  it("renders running tools with spinner", () => {
    const tools: ToolCall[] = [
      { id: "t1", name: "event_search", displayName: "Searching events", status: "running" },
    ];
    render(<ToolIndicator tools={tools} />);
    expect(screen.getByText("Searching events")).toBeTruthy();
  });

  it("renders completed tools with checkmark", () => {
    const tools: ToolCall[] = [
      { id: "t1", name: "event_search", displayName: "Searching events", status: "complete" },
    ];
    render(<ToolIndicator tools={tools} />);
    expect(screen.getByText("Searching events")).toBeTruthy();
  });

  it("renders nothing for empty tools", () => {
    const { container } = render(<ToolIndicator tools={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("falls back to formatted name when displayName matches name", () => {
    const tools: ToolCall[] = [
      { id: "t1", name: "event_search", displayName: "event_search", status: "running" },
    ];
    render(<ToolIndicator tools={tools} />);
    expect(screen.getByText("Searching events")).toBeTruthy();
  });
});

describe("SuggestedPrompts", () => {
  it("renders unauthenticated prompts", () => {
    const onSelect = vi.fn();
    render(<SuggestedPrompts onSelect={onSelect} />);
    expect(screen.getByText("Find events near me")).toBeTruthy();
    expect(screen.getByText("Techno in Berlin")).toBeTruthy();
  });

  it("calls onSelect when a prompt is clicked", () => {
    const onSelect = vi.fn();
    render(<SuggestedPrompts onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Find events near me"));
    expect(onSelect).toHaveBeenCalledWith("Find events near me this weekend");
  });

  it("has ARIA labels on prompt buttons", () => {
    const onSelect = vi.fn();
    render(<SuggestedPrompts onSelect={onSelect} />);
    expect(
      screen.getByLabelText("Ask: Find events near me this weekend")
    ).toBeTruthy();
  });
});
