import { Hero } from "@/components/home/hero";
import { HomeSectorProvider } from "@/components/home/home-sector-context";
import { StatsBand } from "@/components/home/stats-band";
// import { FeaturedListings } from "@/components/home/featured-listings";
import { SectorSidebar } from "@/components/home/sector-sidebar";
import { LatestListings } from "@/components/home/latest-listings";
import { DistrictGrid } from "@/components/home/district-grid";
import { BudgetGuide } from "@/components/home/budget-guide";
import { TrustBand } from "@/components/home/trust-band";
import { HowItWorks } from "@/components/home/how-it-works";
import { AdvertiserCta } from "@/components/home/advertiser-cta";
import { HomeFaq } from "@/components/home/home-faq";
import { fetchLiveAds } from "@/lib/ads/fetch-live-ads";
import { budgetBands, districtFacets } from "@/lib/ads/home-facets";

const HOME_PAGE_SIZE = 30;

export default async function Home() {
  const [land, house] = await Promise.all([
    fetchLiveAds("LAND"),
    fetchLiveAds("HOUSE_RENT"),
  ]);
  const ads = [...land.ads, ...house.ads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Every browse surface below is cut from the ads already fetched here, so
  // the page still costs exactly two requests. Both sectors' first 30 go down
  // with the page so the hero toggle can swap the grid without a round trip.
  const listings = {
    "jayga-jomi": land.ads.slice(0, HOME_PAGE_SIZE),
    "basha-bhara": house.ads.slice(0, HOME_PAGE_SIZE),
  };
  // const featured = selectFeatured(ads, { exclude: ... });
  const districts = districtFacets(ads);

  return (
    <main className="flex flex-1 flex-col">
      <HomeSectorProvider>
        <Hero />
        <StatsBand ads={ads} />

        {/* <FeaturedListings selection={featured} /> */}

        <section className="shell py-14 sm:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
            <SectorSidebar
              counts={{
                "/jayga-jomi": land.ads.length,
                "/basha-bhara": house.ads.length,
              }}
            />
            <LatestListings listings={listings} />
          </div>
        </section>
      </HomeSectorProvider>

      <DistrictGrid districts={districts} />

      <BudgetGuide
        land={budgetBands(land.ads, "LAND")}
        house={budgetBands(house.ads, "HOUSE_RENT")}
      />

      <TrustBand liveCount={ads.length} />

      <HowItWorks />

      <AdvertiserCta />

      <HomeFaq />
    </main>
  );
}
