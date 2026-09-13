import { notFound } from "next/navigation";
import { AdForm } from "@/components/advertiser/ad-form";
import { requireUser } from "@/lib/auth/require-user";
import { fetchAd } from "@/lib/ads/fetch-ad";

export default async function EditAdPage({
  params,
}: PageProps<"/advertiser/ads/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-brand-700">Editing</p>
        <h1 className="font-heading text-title text-neutral-900">{ad.title}</h1>
        <p className="measure text-sm text-muted-foreground">
          Changes are re-checked by our team before the listing returns to the
          public results.
        </p>
      </header>
      <AdForm ad={ad} />
    </main>
  );
}
