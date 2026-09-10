import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { summarizeAdAttributes } from "@/lib/ads/describe-attributes";
import type { Ad } from "@/lib/ads/types";

export function AdCard({ ad }: { ad: Ad }) {
  const summary = summarizeAdAttributes(ad);

  return (
    <Link href={`/ads/${ad.id}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary">
        <div className="aspect-[4/3] bg-muted" />
        <CardHeader>
          <CardTitle className="line-clamp-2">{ad.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {ad.locationArea}, {ad.locationDistrict}
          </p>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2">
          {summary && (
            <p className="text-sm text-muted-foreground">{summary}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-primary">
              {formatPrice(ad.price)}
            </span>
            <Badge variant="success">Live</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
