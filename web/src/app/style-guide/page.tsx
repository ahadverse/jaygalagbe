import { type ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { AdCard } from "@/components/ads/ad-card";
import type { Ad } from "@/lib/ads/types";

const colorScales = [
  { name: "Brand — action, links, price", prefix: "brand" },
  { name: "Accent — paid placement only", prefix: "accent" },
  { name: "Neutral — warm-tinted ink & paper", prefix: "neutral" },
] as const;

const semanticColors = [
  { name: "Success", prefix: "success" },
  { name: "Warning", prefix: "warning" },
  { name: "Danger", prefix: "danger" },
  { name: "Info", prefix: "info" },
] as const;

const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const semanticSteps = [50, 100, 500, 600, 700, 800];

const elevations = [
  { name: "shadow-xs", className: "shadow-xs", use: "Inputs at rest" },
  { name: "shadow-sm", className: "shadow-sm", use: "Cards on the canvas" },
  { name: "shadow-md", className: "shadow-md", use: "Filter panels, stats shelf" },
  { name: "shadow-lg", className: "shadow-lg", use: "Card hover, hero search" },
  { name: "shadow-xl", className: "shadow-xl", use: "Toasts, overlays" },
];

const radii = [
  { name: "sm", className: "rounded-sm" },
  { name: "md", className: "rounded-md" },
  { name: "lg", className: "rounded-lg" },
  { name: "xl", className: "rounded-xl" },
  { name: "2xl", className: "rounded-2xl" },
];

const sampleAd: Ad = {
  id: "sample",
  ownerId: "sample-owner",
  sector: "LAND",
  title: "5 katha corner plot with ready papers, Bashundhara R/A",
  description: "Sample listing used by the style guide.",
  price: 15_000_000,
  locationArea: "Bashundhara R/A",
  locationDistrict: "Dhaka",
  photos: [],
  attributes: { sizeKatha: 5, propertyType: "Residential" },
  status: "LIVE",
  createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  updatedAt: new Date().toISOString(),
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-border pt-10">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        {description && (
          <p className="measure text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-12 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-3">
        <p className="eyebrow text-brand-700">Design system</p>
        <h1 className="font-heading text-display text-neutral-900">
          Jayga Lagbe
        </h1>
        <p className="measure text-base text-muted-foreground">
          A warm editorial marketplace: paper canvas, white sheets that float on
          it, one deep burnt-orange voice for action, and a crimson accent kept
          for paid placement.
        </p>
      </header>

      <Section
        title="Typography"
        description="Display sizes are fluid and tightly tracked; body copy sits on a 68-character measure with open leading."
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="eyebrow mb-2 text-subtle-foreground">text-display</p>
            <p className="font-heading text-display text-neutral-900">
              Find the right jayga
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-subtle-foreground">text-title</p>
            <p className="font-heading text-title text-neutral-900">
              Section title
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-subtle-foreground">
              font-heading / text-lg
            </p>
            <p className="font-heading text-lg font-bold tracking-tight">
              Card and block heading
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-subtle-foreground">text-base</p>
            <p className="measure text-base text-neutral-700">
              Body copy runs in Inter at a comfortable measure so long
              descriptions stay readable. Transliterated place names —
              Dhanmondi, Bashundhara, Chattogram — have to stay legible at small
              sizes too.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-subtle-foreground">
              text-sm / text-xs / text-2xs
            </p>
            <p className="text-sm text-muted-foreground">Supporting text</p>
            <p className="text-xs text-muted-foreground">Metadata row</p>
            <p className="text-2xs text-subtle-foreground">Timestamp</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-subtle-foreground">
              numeric (tabular)
            </p>
            <p className="numeric font-heading text-2xl font-bold tracking-tight text-primary">
              ৳ 1,50,00,000
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Color"
        description="OKLCH ramps. Text on white uses 700+; solid surfaces with white text use 600+ so every pairing clears WCAG AA."
      >
        {colorScales.map((scale) => (
          <div key={scale.prefix} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {scale.name}
            </p>
            <div className="overflow-x-auto">
              <div className="grid min-w-[640px] grid-cols-11 gap-1">
                {scaleSteps.map((step) => (
                  <div
                    key={step}
                    className="numeric flex h-14 items-end justify-center rounded-md p-1 text-[10px] font-semibold"
                    style={{
                      background: `var(--color-${scale.prefix}-${step})`,
                      color: step >= 500 ? "white" : "black",
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Semantic</p>
          {semanticColors.map((scale) => (
            <div key={scale.prefix} className="overflow-x-auto">
              <div className="grid min-w-[640px] grid-cols-6 gap-1">
                {semanticSteps.map((step) => (
                  <div
                    key={step}
                    className="flex h-12 items-end justify-center rounded-md p-1 text-[10px] font-semibold"
                    style={{
                      background: `var(--color-${scale.prefix}-${step})`,
                      color: step >= 500 ? "white" : "black",
                    }}
                  >
                    {scale.prefix}-{step}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Surface & elevation"
        description="The page ground is warm paper; cards are pure white. Depth comes from warm-tinted shadows, not from a border on every box."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {elevations.map((level) => (
            <div
              key={level.name}
              className={`flex flex-col gap-1 rounded-xl bg-card p-4 ${level.className}`}
            >
              <span className="font-heading text-sm font-bold">
                {level.name}
              </span>
              <span className="text-xs text-muted-foreground">{level.use}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {radii.map((radius) => (
            <div
              key={radius.name}
              className={`flex size-20 items-center justify-center bg-brand-100 text-xs font-semibold text-brand-800 ${radius.className}`}
            >
              {radius.name}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Buttons"
        description="Pill shapes, 44px default height for thumbs, and a built-in loading state."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Boost this ad</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Remove listing</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button loading>Saving…</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Land</Badge>
          <Badge variant="boost">Boosted</Badge>
          <Badge variant="accent">Premium</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="warning">Pending review</Badge>
          <Badge variant="danger">Rejected</Badge>
          <Badge variant="info">Sold</Badge>
          <Badge variant="neutral">Removed</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>
      </Section>

      <Section
        title="Form controls"
        description="Labels sit above the field in small caps-weight text; hints and errors are wired to the input with aria-describedby."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email or phone" placeholder="you@example.com" />
          <Input
            label="Price"
            adornment="৳"
            placeholder="15000000"
            hint="Whole taka, no commas."
          />
          <Input label="Price" placeholder="15000000" error="Price is required" />
          <Select label="Property type" defaultValue="">
            <option value="">Any type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </Select>
          <Input label="Disabled" placeholder="Not editable" disabled />
          <Textarea label="Description" placeholder="Tell buyers about it…" />
        </div>
      </Section>

      <Section title="Feedback">
        <div className="flex flex-col gap-3">
          <Alert>Email or password is incorrect.</Alert>
          <Alert variant="success">Review saved.</Alert>
          <Alert variant="info">Your ad is queued for review.</Alert>
          <Alert variant="warning">This boost expires in 2 days.</Alert>
        </div>
      </Section>

      <Section
        title="Cards"
        description="Three elevations: raised (default) floats, flat groups, outline suits dense data."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {(["raised", "flat", "outline"] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader>
                <CardTitle className="capitalize">{variant}</CardTitle>
                <CardDescription>Dhaka, Bashundhara R/A</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="numeric font-heading text-lg font-bold text-primary">
                  ৳ 1,50,00,000
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Ad card"
        description="The most-repeated element on the site. Boosted listings get an accent ring, a top rule and a solid accent badge — never a garish fill."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <AdCard ad={sampleAd} />
          <AdCard ad={sampleAd} boosted />
        </div>
      </Section>

      <Section
        title="Loading & empty"
        description="Skeletons mirror the real layout so the swap is a crossfade, not a reflow."
      >
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <EmptyState
          title="No listings match those filters"
          description="Try widening the price range or clearing the location to see more of what's available."
          action={<Button variant="outline" size="sm">Clear all filters</Button>}
        />
      </Section>

      <Section
        title="Motion"
        description="Entrances are short and upward; hovers lift by 2–4px. Everything collapses to zero under prefers-reduced-motion."
      >
        <div className="flex flex-wrap gap-3">
          {["animate-fade-in", "animate-rise"].map((animation) => (
            <div
              key={animation}
              className={`rounded-xl bg-card px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-neutral-900/5 ${animation}`}
            >
              {animation}
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
