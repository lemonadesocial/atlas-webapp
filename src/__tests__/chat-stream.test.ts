import { describe, it, expect } from "vitest";
import { parseSSEStream } from "@/lib/hooks/useChat";

describe("parseSSEStream", () => {
  it("parses text_delta events", () => {
    const chunk = 'data: {"type":"text_delta","text":"Hello"}\n\n';
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "text_delta", text: "Hello" });
  });

  it("parses multiple events in one chunk", () => {
    const chunk = [
      'data: {"type":"text_delta","text":"Hi"}',
      'data: {"type":"text_delta","text":" there"}',
      "",
    ].join("\n");
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(2);
    expect(events[0].text).toBe("Hi");
    expect(events[1].text).toBe(" there");
  });

  it("parses tool_start events", () => {
    const chunk = 'data: {"type":"tool_start","tool":{"id":"t1","name":"event_search","displayName":"Searching events"}}\n';
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_start");
    expect(events[0].tool?.name).toBe("event_search");
  });

  it("parses tool_end events", () => {
    const chunk = 'data: {"type":"tool_end","tool":{"id":"t1","name":"event_search"},"result":"found 5 events"}\n';
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("tool_end");
    expect(events[0].result).toBe("found 5 events");
  });

  it("parses event_results with event data", () => {
    const eventData = {
      type: "event_results",
      events: [
        {
          id: "e1",
          title: "Test Event",
          start: "2026-04-01T20:00:00Z",
          source_platform: "lemonade",
        },
      ],
    };
    const chunk = `data: ${JSON.stringify(eventData)}\n`;
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].events).toHaveLength(1);
    expect(events[0].events![0].title).toBe("Test Event");
  });

  it("handles [DONE] signal", () => {
    const chunk = "data: [DONE]\n";
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("done");
  });

  it("skips empty lines and non-data lines", () => {
    const chunk = "\n\n: comment\ndata: {\"type\":\"text_delta\",\"text\":\"x\"}\n\n";
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].text).toBe("x");
  });

  it("handles malformed JSON gracefully", () => {
    const chunk = "data: {invalid json\n\ndata: {\"type\":\"text_delta\",\"text\":\"ok\"}\n";
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].text).toBe("ok");
  });

  it("parses error events", () => {
    const chunk = 'data: {"type":"error","error":"Something went wrong"}\n';
    const events = parseSSEStream(chunk);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("error");
    expect(events[0].error).toBe("Something went wrong");
  });

  it("returns empty array for empty input", () => {
    expect(parseSSEStream("")).toEqual([]);
    expect(parseSSEStream("\n\n")).toEqual([]);
  });
});
