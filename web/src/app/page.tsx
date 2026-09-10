import { Hero } from "@/components/home/hero";
import { SectorCards } from "@/components/home/sector-cards";
import { HowItWorks } from "@/components/home/how-it-works";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <SectorCards />
      <HowItWorks />
    </main>
  );
}
