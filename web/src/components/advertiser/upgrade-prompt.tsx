import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { upgradeToAdvertiserAction } from "@/lib/auth/advertiser-actions";

export function UpgradePrompt() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Become an advertiser</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Upgrade your account to post land and rental listings, boost them,
          and track performance.
        </p>
        <form action={upgradeToAdvertiserAction}>
          <Button type="submit" className="w-full">
            Upgrade to advertiser
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
