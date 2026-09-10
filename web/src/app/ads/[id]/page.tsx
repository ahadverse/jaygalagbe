import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { ContactGate } from "@/components/ads/contact-gate";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { describeAdAttributes } from "@/lib/ads/describe-attributes";
import { formatPrice } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/session";

const statusBadge = {
  LIVE: { label: "Live", variant: "success" as const },
  PENDING: { label: "Pending review", variant: "warning" as const },
  REJECTED: { label: "Rejected", variant: "danger" as const },
  SOLD: { label: "Sold", variant: "info" as const },
  REMOVED: { label: "Removed", variant: "neutral" as const },
};

export async function generateMetadata({
  params,
}: PageProps<"/ads/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad) {
    return {};
  }

  return {
    title: `${ad.title} | Jayga Lagbe`,
    description: ad.description.slice(0, 160),
  };
}

export default async function AdDetailPage({ params }: PageProps<"/ads/[id]">) {
  const { id } = await params;
  const [ad, currentUser] = await Promise.all([fetchAd(id), getCurrentUser()]);
  if (!ad) {
    notFound();
  }

  const facts = describeAdAttributes(ad);
  const badge = statusBadge[ad.status];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="aspect-[16/9] w-full rounded-xl bg-muted" />

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {ad.title}
            </h1>
            <p className="text-muted-foreground">
              {ad.locationArea}, {ad.locationDistrict}
              {ad.address ? ` — ${ad.address}` : ""}
            </p>
            <p className="text-2xl font-semibold text-primary">
              {formatPrice(ad.price)}
            </p>
          </div>

          {facts.length > 0 && (
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {fact.label}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="whitespace-pre-line text-muted-foreground">
              {ad.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ContactGate
            adId={ad.id}
            ownerId={ad.ownerId}
            currentUser={currentUser}
          />
        </div>
      </div>
    </main>
  );
}
