import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ForOrganizers } from "@/components/landing/ForOrganizers";
import { ForAttendees } from "@/components/landing/ForAttendees";
import { Stats } from "@/components/landing/Stats";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ForOrganizers />
      <ForAttendees />
      <Stats />
    </>
  );
}
