import { requireUser } from "@/lib/auth/require-user";
import { UpgradePrompt } from "@/components/advertiser/upgrade-prompt";

export default async function AdvertiserLayout({
  children,
}: LayoutProps<"/advertiser">) {
  const user = await requireUser();

  if (!user.isAdvertiser) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <UpgradePrompt />
      </main>
    );
  }

  return <>{children}</>;
}
