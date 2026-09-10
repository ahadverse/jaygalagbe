"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@/components/ui";
import { pingVisit } from "@/lib/analytics/track";

export function ContactGate({ adId }: { adId: string }) {
  const [visitId, setVisitId] = useState<string | null>(null);
  const pinged = useRef(false);

  useEffect(() => {
    if (pinged.current) return;
    pinged.current = true;
    void pingVisit(adId).then(setVisitId);
  }, [adId]);

  const from = `/ads/${adId}`;
  const suffix = `from=${encodeURIComponent(from)}${
    visitId ? `&visitId=${encodeURIComponent(visitId)}` : ""
  }`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact the advertiser</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Log in or create a free account to message the advertiser directly.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/login?${suffix}`}
            className={buttonVariants({ variant: "primary" })}
          >
            Log in
          </Link>
          <Link
            href={`/register?${suffix}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
