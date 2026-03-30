import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EventJsonLd } from "@/app/events/[id]/EventJsonLd";

describe("EventJsonLd", () => {
  const baseEvent = {
    title: "Test Event",
    description: "A test event",
    start: "2026-06-15T20:00:00Z",
    location: "Berlin",
    city: "Berlin",
    country: "DE",
    organizer_name: "Test Org",
    min_price: 10,
    currency: "EUR",
  };

  it("renders JSON-LD script tag", () => {
    const { container } = render(
      <EventJsonLd event={baseEvent} eventId="test-123" />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
  });

  it("contains correct schema.org type", () => {
    const { container } = render(
      <EventJsonLd event={baseEvent} eventId="test-123" />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || "";
    expect(content).toContain('"@type":"Event"');
  });

  it("escapes script tag breakout in title (XSS prevention)", () => {
    const maliciousEvent = {
      ...baseEvent,
      title: '</script><script>alert("xss")</script>',
    };
    const { container } = render(
      <EventJsonLd event={maliciousEvent} eventId="test-123" />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || "";
    // Must not contain literal </script>
    expect(content).not.toContain("</script>");
    expect(content).toContain("\\u003c");
  });

  it("includes location data when provided", () => {
    const { container } = render(
      <EventJsonLd event={baseEvent} eventId="test-123" />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || "";
    expect(content).toContain("Berlin");
    expect(content).toContain("Place");
  });

  it("includes offer data when price is set", () => {
    const { container } = render(
      <EventJsonLd event={baseEvent} eventId="test-123" />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || "";
    expect(content).toContain("Offer");
    expect(content).toContain("EUR");
  });
});
