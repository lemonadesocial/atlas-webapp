"use client";

import type { SuggestedPrompt } from "@/lib/types/chat";
import { useAuth } from "@/lib/hooks/useAuth";

const UNAUTHENTICATED_PROMPTS: SuggestedPrompt[] = [
  { label: "Find events near me", prompt: "Find events near me this weekend" },
  { label: "Techno in Berlin", prompt: "Techno events in Berlin" },
  { label: "Free workshops", prompt: "Free workshops and meetups happening soon" },
  { label: "Music festivals", prompt: "Upcoming music festivals" },
];

const AUTHENTICATED_PROMPTS: SuggestedPrompt[] = [
  { label: "My events", prompt: "Show my upcoming events" },
  { label: "Ticket sales", prompt: "How are ticket sales for my events?" },
  { label: "Create an event", prompt: "Create a new event" },
  { label: "Find events near me", prompt: "Find events near me this weekend" },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const { user } = useAuth();
  const prompts = user ? AUTHENTICATED_PROMPTS : UNAUTHENTICATED_PROMPTS;

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <p className="text-sm text-secondary">Try asking:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {prompts.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p.prompt)}
            className="rounded-full border border-divider px-4 py-2 text-sm text-secondary transition-colors hover:border-accent hover:text-primary"
            aria-label={`Ask: ${p.prompt}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
