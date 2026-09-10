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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Edit ad</h1>
      <AdForm ad={ad} />
    </main>
  );
}
