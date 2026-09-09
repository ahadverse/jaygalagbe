import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";

const colorScales = [
  { name: "Brand", prefix: "brand" },
  { name: "Accent", prefix: "accent" },
  { name: "Neutral", prefix: "neutral" },
] as const;

const semanticColors = [
  { name: "Success", prefix: "success" },
  { name: "Warning", prefix: "warning" },
  { name: "Danger", prefix: "danger" },
  { name: "Info", prefix: "info" },
] as const;

const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const semanticSteps = [50, 100, 500, 600, 700];

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Jayga Lagbe design system
        </h1>
        <p className="text-muted-foreground">
          Colors, typography, and base components shared across the public
          site and dashboards.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Colors</h2>
        {colorScales.map((scale) => (
          <div key={scale.prefix} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {scale.name}
            </p>
            <div className="grid grid-cols-11 gap-1">
              {scaleSteps.map((step) => (
                <div
                  key={step}
                  className="flex h-12 items-end justify-center rounded-sm p-1 text-[10px] font-medium"
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
        ))}

        <p className="text-sm font-medium text-muted-foreground">Semantic</p>
        <div className="flex flex-col gap-2">
          {semanticColors.map((scale) => (
            <div key={scale.prefix} className="grid grid-cols-11 gap-1">
              {semanticSteps.map((step) => (
                <div
                  key={step}
                  className="col-span-2 flex h-12 items-end justify-center rounded-sm p-1 text-[10px] font-medium"
                  style={{
                    background: `var(--color-${scale.prefix}-${step})`,
                    color: step >= 500 ? "white" : "black",
                  }}
                >
                  {scale.prefix}-{step}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Typography</h2>
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-bold">Heading 1 — 4xl bold</p>
          <p className="text-2xl font-semibold">Heading 2 — 2xl semibold</p>
          <p className="text-lg font-semibold">Heading 3 — lg semibold</p>
          <p className="text-base">Body — base regular</p>
          <p className="text-sm text-muted-foreground">
            Muted / caption — sm regular
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Boost this ad</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Remove listing</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">Land</Badge>
          <Badge variant="accent">Boosted</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger">Rejected</Badge>
          <Badge variant="info">Sold</Badge>
          <Badge variant="neutral">Removed</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Form controls</h2>
        <div className="max-w-sm">
          <Input label="Email or phone" placeholder="you@example.com" />
        </div>
        <div className="max-w-sm">
          <Input
            label="Price"
            placeholder="15,000,000"
            error="Price is required"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>3 Katha residential land — Bashundhara</CardTitle>
            <CardDescription>Dhaka, Bashundhara R/A</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-lg font-semibold text-primary">
              ৳ 1,50,00,000
            </span>
            <Badge variant="success">Live</Badge>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
