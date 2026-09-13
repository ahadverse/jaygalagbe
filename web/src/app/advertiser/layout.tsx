import { requireUser } from "@/lib/auth/require-user";
import { UpgradePrompt } from "@/components/advertiser/upgrade-prompt";
import { AdvertiserTabs } from "@/components/advertiser/advertiser-tabs";

export default async function AdvertiserLayout({
  children,
}: LayoutProps<"/advertiser">) {
  const user = await requireUser();

  if (!user.isAdvertiser) {
    return (
      <main className="grain relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-background px-5 py-14 sm:py-20">
        <div className="w-full max-w-md">
          <UpgradePrompt />
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur-md sm:top-18">
        <AdvertiserTabs />
      </div>
      {children}
    </>
  );
}
