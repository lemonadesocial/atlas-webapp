import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/image
vi.mock("next/image", () => ({
  // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props;
    return <img alt="" {...rest} data-fill={fill ? "true" : "false"} />;
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { EventCard } from "@/components/discover/EventCard";

const lemonadeEvent = {
  id: "event-123",
  title: "Tech Meetup Berlin",
  description: "A tech meetup",
  start: "2026-06-15T18:00:00Z",
  city: "Berlin",
  country: "DE",
  source_platform: "lemonade",
  min_price: 0,
  max_price: 0,
  currency: "USD",
};

const externalEvent = {
  id: "",
  title: "External Party",
  description: "An external event",
  start: "2026-07-01T21:00:00Z",
  city: "London",
  source_platform: "eventbrite",
  url: "https://eventbrite.com/e/12345",
};

describe("EventCard", () => {
  it("renders event title", () => {
    render(<EventCard event={lemonadeEvent} />);
    expect(screen.getByText("Tech Meetup Berlin")).toBeInTheDocument();
  });

  it("links to internal /events/[id] for lemonade events", () => {
    const { container } = render(<EventCard event={lemonadeEvent} />);
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "/events/event-123");
    expect(link).not.toHaveAttribute("target");
  });

  it("links to external URL for non-lemonade events with no id", () => {
    const { container } = render(<EventCard event={externalEvent} />);
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "https://eventbrite.com/e/12345");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays city", () => {
    const { container } = render(<EventCard event={lemonadeEvent} />);
    expect(container.textContent).toContain("Berlin, DE");
  });

  it("displays Free for zero price", () => {
    const { container } = render(<EventCard event={lemonadeEvent} />);
    expect(container.textContent).toContain("Free");
  });

  it("displays platform badge", () => {
    const { container } = render(<EventCard event={lemonadeEvent} />);
    expect(container.textContent).toContain("lemonade");
  });
});
