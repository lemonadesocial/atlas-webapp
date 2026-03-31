"use client";

import { useState, useCallback, memo } from "react";
import { STRINGS } from "@/lib/utils/constants";
import { trackEvent } from "@/lib/utils/analytics";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-divider bg-card p-6 sm:p-8">
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xl font-bold text-primary font-display sm:text-2xl">
      {children}
    </h2>
  );
}

/* US-7.1: What is Atlas Protocol */
function WhatIsAtlas() {
  return (
    <SectionCard>
      <SectionTitle>{STRINGS.docsWhatIsAtlasTitle}</SectionTitle>
      <p className="text-secondary leading-relaxed">
        {STRINGS.docsWhatIsAtlasBody}
      </p>
    </SectionCard>
  );
}

/* US-7.2: How it works -- three-layer model */
function HowItWorks() {
  const layers = [
    { title: STRINGS.docsLayer1Title, desc: STRINGS.docsLayer1Desc },
    { title: STRINGS.docsLayer2Title, desc: STRINGS.docsLayer2Desc },
    { title: STRINGS.docsLayer3Title, desc: STRINGS.docsLayer3Desc },
  ];

  return (
    <SectionCard>
      <SectionTitle>{STRINGS.docsHowItWorksTitle}</SectionTitle>
      <p className="mb-6 text-secondary leading-relaxed">
        {STRINGS.docsHowItWorksIntro}
      </p>
      <div className="space-y-4">
        {layers.map((layer) => (
          <div
            key={layer.title}
            className="rounded-md border border-divider bg-background p-4"
          >
            <h3 className="mb-2 text-sm font-semibold text-accent">
              {layer.title}
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              {layer.desc}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* US-7.3: API Reference */
function ApiReference() {
  const endpoints = [
    { method: "GET", path: STRINGS.docsApiSearchEndpoint.replace("GET ", ""), desc: STRINGS.docsApiSearchDesc },
    { method: "GET", path: STRINGS.docsApiEventsEndpoint.replace("GET ", ""), desc: STRINGS.docsApiEventsDesc },
    { method: "POST", path: STRINGS.docsApiHoldsEndpoint.replace("POST ", ""), desc: STRINGS.docsApiHoldsDesc },
    { method: "POST", path: STRINGS.docsApiCheckoutEndpoint.replace("POST ", ""), desc: STRINGS.docsApiCheckoutDesc },
    { method: "GET", path: STRINGS.docsApiReceiptsEndpoint.replace("GET ", ""), desc: STRINGS.docsApiReceiptsDesc },
  ];

  return (
    <SectionCard>
      <SectionTitle>{STRINGS.docsApiReferenceTitle}</SectionTitle>
      <p className="mb-4 text-secondary">{STRINGS.docsApiReferenceDesc}</p>
      <p className="mb-6 text-sm text-tertiary">{STRINGS.docsApiVersionHeader}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="table">
          <thead>
            <tr className="border-b border-divider">
              <th className="pb-3 pr-4 font-semibold text-primary" scope="col">Endpoint</th>
              <th className="pb-3 font-semibold text-primary" scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.path} className="border-b border-divider last:border-0">
                <td className="py-3 pr-4 align-top">
                  <code className="whitespace-nowrap rounded bg-chip-bg px-2 py-1 text-xs text-accent">
                    {ep.method} {ep.path}
                  </code>
                </td>
                <td className="py-3 text-secondary">{ep.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* US-7.4: CLI Reference */
function CliReference() {
  return (
    <SectionCard>
      <SectionTitle>{STRINGS.docsCliTitle}</SectionTitle>
      <p className="mb-4 text-secondary">{STRINGS.docsCliDesc}</p>
      <div className="mb-4 rounded-md bg-background border border-divider p-4">
        <p className="mb-1 text-xs text-tertiary">Install</p>
        <code className="text-sm text-accent">{STRINGS.docsCliInstall}</code>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={`https://www.npmjs.com/package/${STRINGS.docsCliNpmPackage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-divider px-4 py-2 text-sm text-secondary transition-colors hover:border-accent hover:text-primary"
          aria-label={`View ${STRINGS.docsCliNpmPackage} on npm`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M0 0v16h16V0H0zm13 13H8V5h-2v8H3V3h10v10z" />
          </svg>
          npm
        </a>
        <a
          href={`https://github.com/${STRINGS.docsCliGithubRepo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-divider px-4 py-2 text-sm text-secondary transition-colors hover:border-accent hover:text-primary"
          aria-label={`View ${STRINGS.docsCliGithubRepo} on GitHub`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </div>
    </SectionCard>
  );
}

/* US-7.5: Supported Platforms */
function SupportedPlatforms() {
  const platforms = [
    { name: STRINGS.docsPlatformLemonade, desc: STRINGS.docsPlatformLemonadeDesc, badge: "Native" },
    { name: STRINGS.docsPlatformEventbrite, desc: STRINGS.docsPlatformEventbriteDesc, badge: "OAuth" },
    { name: STRINGS.docsPlatformLuma, desc: STRINGS.docsPlatformLumaDesc, badge: "API Key" },
  ];

  return (
    <SectionCard>
      <SectionTitle>{STRINGS.docsPlatformsTitle}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="rounded-md border border-divider bg-background p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-primary">{p.name}</h3>
              <span className="rounded-full bg-chip-bg px-2 py-0.5 text-xs text-tertiary">
                {p.badge}
              </span>
            </div>
            <p className="text-sm text-secondary">{p.desc}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* US-7.6: FAQ Accordion */
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-divider last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-primary transition-colors hover:text-accent"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-secondary leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback(
    (index: number) => {
      const isOpening = openIndex !== index;
      setOpenIndex(isOpening ? index : null);
      if (isOpening) {
        trackEvent("faq_expand", { question: STRINGS.docsFaq[index].q });
      }
    },
    [openIndex]
  );

  return (
    <SectionCard>
      <SectionTitle>{STRINGS.docsFaqTitle}</SectionTitle>
      <div>
        {STRINGS.docsFaq.map((item, i) => (
          <FaqItem
            key={item.q}
            question={item.q}
            answer={item.a}
            isOpen={openIndex === i}
            onToggle={() => handleToggle(i)}
          />
        ))}
      </div>
    </SectionCard>
  );
}

/* US-7.7: Loading skeleton */
export function DocsPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6" aria-label="Loading documentation">
      <div className="skeleton mb-8 h-10 w-64 rounded-md" />
      <div className="skeleton mb-4 h-5 w-96 rounded-md" />
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/* US-7.8: Error state with retry */
export function DocsPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <p className="mb-4 text-lg text-secondary">{STRINGS.docsLoadError}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        aria-label="Retry loading documentation"
      >
        {STRINGS.retry}
      </button>
    </div>
  );
}

/* Main docs content */
export const DocsContent = memo(function DocsContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-primary font-display sm:text-4xl">
        {STRINGS.docsTitle}
      </h1>
      <p className="mb-10 text-lg text-secondary">
        {STRINGS.docsDescription}
      </p>
      <div className="space-y-8">
        <WhatIsAtlas />
        <HowItWorks />
        <ApiReference />
        <CliReference />
        <SupportedPlatforms />
        <FaqSection />
      </div>
    </div>
  );
});
