import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { BoostForm } from "@/components/advertiser/boost-form";

export default async function BoostAdPage({
  params,
}: PageProps<"/advertiser/ads/[id]/boost">) {
  const user = await requireUser();
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  if (ad.status !== "LIVE") {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-bold text-foreground">Boost this ad</h1>
        <p className="text-muted-foreground">
          Only live ads can be boosted. This ad is currently{" "}
          {ad.status.toLowerCase()}.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Boost this ad</h1>
        <p className="text-muted-foreground">{ad.title}</p>
      </div>
      <BoostForm adId={ad.id} />
    </main>
  );
}
