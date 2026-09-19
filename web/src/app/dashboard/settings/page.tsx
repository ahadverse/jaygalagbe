import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel } from "@/components/dashboard/panel";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/auth/require-user";
import { logoutAction } from "@/lib/auth/actions";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Settings | Jayga Lagbe",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Settings"
        description="How you appear to the people you buy from and sell to."
      />

      <Panel title="Profile" description="Shown on your listings and messages.">
        <ProfileForm user={user} />
      </Panel>

      <Panel title="Account">
        <dl className="flex flex-col divide-y divide-border/70 text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium text-foreground">
              {formatRelativeTime(user.createdAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-muted-foreground">Verification</dt>
            <dd className="font-medium text-foreground">
              {user.isVerified ? "Verified" : "Not verified yet"}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Session"
        description="Signing out clears this browser's session only."
      >
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </Panel>
    </div>
  );
}
