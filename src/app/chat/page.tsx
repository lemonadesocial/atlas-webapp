import type { Metadata } from "next";
import { ChatPageClient } from "./ChatPageClient";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "Search events, get recommendations, or manage your events with natural language.",
};

export default function ChatPage() {
  return <ChatPageClient />;
}
