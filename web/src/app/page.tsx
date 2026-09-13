import { Hero } from "@/components/home/hero";
import { StatsBand } from "@/components/home/stats-band";
import { SectorSidebar } from "@/components/home/sector-sidebar";
import { LatestListings } from "@/components/home/latest-listings";
import { HowItWorks } from "@/components/home/how-it-works";
import { fetchLiveAds } from "@/lib/ads/fetch-live-ads";

export default async function Home() {
  const [land, house] = await Promise.all([
    fetchLiveAds("LAND"),
    fetchLiveAds("HOUSE_RENT"),
  ]);
  const ads = [...land.ads, ...house.ads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <StatsBand ads={ads} />

      <section className="shell py-14 sm:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <SectorSidebar
            counts={{
              "/jayga-jomi": land.ads.length,
              "/basha-bhara": house.ads.length,
            }}
          />
          <LatestListings ads={ads.slice(0, 9)} />
        </div>
      </section>

      <HowItWorks />
    </main>
  );
}
