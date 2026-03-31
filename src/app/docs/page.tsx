import type { Metadata } from "next";
import { Suspense } from "react";
import { STRINGS } from "@/lib/utils/constants";
import { DocsContent, DocsPageSkeleton } from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: STRINGS.docsTitle,
  description: STRINGS.docsDescription,
};

export default function DocsPage() {
  return (
    <Suspense fallback={<DocsPageSkeleton />}>
      <DocsContent />
    </Suspense>
  );
}
