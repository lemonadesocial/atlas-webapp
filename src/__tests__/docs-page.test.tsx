import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { STRINGS } from "@/lib/utils/constants";

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

// Mock Sentry to avoid pulling in the full SDK
vi.mock("@sentry/nextjs", () => ({
  addBreadcrumb: vi.fn(),
  startInactiveSpan: vi.fn(() => ({ end: vi.fn() })),
}));

// Import after mocks
import { DocsContent, DocsPageSkeleton, DocsPageError } from "@/components/docs/DocsContent";

describe("DocsContent", () => {
  it("renders the page title and description (US-7.1)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsTitle)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsDescription)).toBeInTheDocument();
  });

  it("renders What is Atlas section (US-7.1)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsWhatIsAtlasTitle)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsWhatIsAtlasBody)).toBeInTheDocument();
  });

  it("renders How it Works section with three layers (US-7.2)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsHowItWorksTitle)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsLayer1Title)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsLayer2Title)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsLayer3Title)).toBeInTheDocument();
  });

  it("renders API Reference section with endpoints (US-7.3)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsApiReferenceTitle)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsApiVersionHeader)).toBeInTheDocument();
    // Check endpoint table exists
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders CLI Reference section with npm and GitHub links (US-7.4)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsCliTitle)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsCliInstall)).toBeInTheDocument();
    const npmLink = screen.getByLabelText(`View ${STRINGS.docsCliNpmPackage} on npm`);
    expect(npmLink).toHaveAttribute(
      "href",
      `https://www.npmjs.com/package/${STRINGS.docsCliNpmPackage}`
    );
    const githubLink = screen.getByLabelText(`View ${STRINGS.docsCliGithubRepo} on GitHub`);
    expect(githubLink).toHaveAttribute(
      "href",
      `https://github.com/${STRINGS.docsCliGithubRepo}`
    );
  });

  it("renders Supported Platforms section with all platforms (US-7.5)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsPlatformsTitle)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsPlatformLemonade)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsPlatformEventbrite)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsPlatformLuma)).toBeInTheDocument();
  });

  it("renders FAQ section with all questions (US-7.6)", () => {
    render(<DocsContent />);
    expect(screen.getByText(STRINGS.docsFaqTitle)).toBeInTheDocument();
    for (const item of STRINGS.docsFaq) {
      expect(screen.getByText(item.q)).toBeInTheDocument();
    }
  });
});

describe("FAQ accordion interaction (US-7.6)", () => {
  it("answers are hidden by default", () => {
    render(<DocsContent />);
    for (const item of STRINGS.docsFaq) {
      expect(screen.queryByText(item.a)).not.toBeInTheDocument();
    }
  });

  it("clicking a question reveals the answer", () => {
    render(<DocsContent />);
    const firstQuestion = screen.getByText(STRINGS.docsFaq[0].q);
    fireEvent.click(firstQuestion);
    expect(screen.getByText(STRINGS.docsFaq[0].a)).toBeInTheDocument();
  });

  it("clicking the same question hides the answer", () => {
    render(<DocsContent />);
    const firstQuestion = screen.getByText(STRINGS.docsFaq[0].q);
    fireEvent.click(firstQuestion);
    expect(screen.getByText(STRINGS.docsFaq[0].a)).toBeInTheDocument();
    fireEvent.click(firstQuestion);
    expect(screen.queryByText(STRINGS.docsFaq[0].a)).not.toBeInTheDocument();
  });

  it("clicking a different question closes the previous one", () => {
    render(<DocsContent />);
    fireEvent.click(screen.getByText(STRINGS.docsFaq[0].q));
    expect(screen.getByText(STRINGS.docsFaq[0].a)).toBeInTheDocument();
    fireEvent.click(screen.getByText(STRINGS.docsFaq[1].q));
    expect(screen.queryByText(STRINGS.docsFaq[0].a)).not.toBeInTheDocument();
    expect(screen.getByText(STRINGS.docsFaq[1].a)).toBeInTheDocument();
  });

  it("FAQ buttons have aria-expanded attribute", () => {
    render(<DocsContent />);
    const buttons = screen.getAllByRole("button", { expanded: false });
    const faqButton = buttons.find(
      (btn) => btn.textContent?.includes(STRINGS.docsFaq[0].q)
    );
    expect(faqButton).toBeDefined();
    expect(faqButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(faqButton!);
    expect(faqButton).toHaveAttribute("aria-expanded", "true");
  });
});

describe("DocsPageSkeleton (US-7.7)", () => {
  it("renders loading skeleton with aria-label", () => {
    render(<DocsPageSkeleton />);
    expect(screen.getByLabelText("Loading documentation")).toBeInTheDocument();
  });

  it("renders multiple skeleton blocks", () => {
    const { container } = render(<DocsPageSkeleton />);
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });
});

describe("DocsPageError (US-7.8)", () => {
  it("renders error message and retry button", () => {
    const onRetry = vi.fn();
    render(<DocsPageError onRetry={onRetry} />);
    expect(screen.getByText(STRINGS.docsLoadError)).toBeInTheDocument();
    expect(screen.getByText(STRINGS.retry)).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(<DocsPageError onRetry={onRetry} />);
    fireEvent.click(screen.getByText(STRINGS.retry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("retry button has aria-label", () => {
    render(<DocsPageError onRetry={vi.fn()} />);
    expect(
      screen.getByLabelText("Retry loading documentation")
    ).toBeInTheDocument();
  });
});

describe("String extraction completeness (US-NF.24)", () => {
  it("all docs strings in STRINGS are non-empty", () => {
    const docsKeys = Object.keys(STRINGS).filter((k) => k.startsWith("docs"));
    expect(docsKeys.length).toBeGreaterThan(0);
    for (const key of docsKeys) {
      const value = STRINGS[key as keyof typeof STRINGS];
      if (typeof value === "string") {
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it("nav strings exist in STRINGS", () => {
    expect(STRINGS.navExplore).toBe("Explore");
    expect(STRINGS.navLeaderboard).toBe("Leaderboard");
    expect(STRINGS.navDocs).toBe("Docs");
    expect(STRINGS.navChat).toBe("Chat");
  });

  it("footer strings exist in STRINGS", () => {
    expect(STRINGS.footerProtocol).toBeTruthy();
    expect(STRINGS.footerDocumentation).toBeTruthy();
    expect(STRINGS.footerGitHub).toBeTruthy();
    expect(STRINGS.footerMainSite).toBeTruthy();
    expect(STRINGS.footerLegal).toBeTruthy();
    expect(STRINGS.footerTerms).toBeTruthy();
    expect(STRINGS.footerTagline).toBeTruthy();
  });

  it("FAQ array has at least 5 entries with q and a", () => {
    expect(STRINGS.docsFaq.length).toBeGreaterThanOrEqual(5);
    for (const item of STRINGS.docsFaq) {
      expect(item.q).toBeTruthy();
      expect(item.a).toBeTruthy();
    }
  });
});
