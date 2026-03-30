import type { Metadata } from "next";
import { SITE_URL } from "@/lib/utils/constants";
import { LeaderboardContent } from "@/components/leaderboard/LeaderboardContent";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top spaces and communities on Atlas by activity and engagement.",
  alternates: { canonical: `${SITE_URL}/leaderboard` },
};

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
