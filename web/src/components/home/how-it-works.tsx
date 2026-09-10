const steps = [
  {
    step: "01",
    title: "Browse & filter",
    description:
      "Search Jayga Bikroy or Basa Bhara listings by location, price, and size — no account needed.",
  },
  {
    step: "02",
    title: "Message the advertiser",
    description:
      "Create a free account to unlock direct, real-time chat with the person behind the listing.",
  },
  {
    step: "03",
    title: "Close with confidence",
    description:
      "Every ad is manually reviewed before it goes live, so you're never chasing a fake listing.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            How Jayga Lagbe works
          </h2>
          <p className="text-muted-foreground">
            From search to conversation in three simple steps.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="flex flex-col gap-2">
              <span className="text-sm font-bold text-primary">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
