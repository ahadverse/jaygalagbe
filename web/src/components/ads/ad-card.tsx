import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { summarizeAdAttributes } from "@/lib/ads/describe-attributes";
import { PhotoPlaceholder } from "./photo-placeholder";
import type { Ad } from "@/lib/ads/types";

export function AdCard({ ad }: { ad: Ad }) {
  const summary = summarizeAdAttributes(ad);

  return (
    <Link href={`/ads/${ad.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <PhotoPlaceholder sector={ad.sector} className="aspect-[4/3]" />
        <CardHeader>
          <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
            {ad.title}
          </CardTitle>
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
