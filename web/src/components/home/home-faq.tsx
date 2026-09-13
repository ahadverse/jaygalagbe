import { boostTiers } from "@/lib/boost/config";
import { formatAmount } from "@/lib/format";

const cheapestBoost = boostTiers.reduce((cheapest, tier) =>
  tier.priceBdt < cheapest.priceBdt ? tier : cheapest,
);
const tierLabels = boostTiers.map((tier) => tier.label).join(", ");

const faqs = [
  {
    question: "Is Jayga Lagbe free to use?",
    answer:
      "Browsing and searching are free and need no account at all. Creating an account is free, and so is posting a listing. Boosting an ad is the only thing on the platform you ever pay for.",
  },
  {
    question: "How long before my ad goes live?",
    answer:
      "Every submission goes into a review queue and a person checks it, usually within a day. If it is rejected you are told the reason, and you can fix the ad and resubmit it without starting again.",
  },
  {
    question: "How do I contact an advertiser?",
    answer:
      "Open the listing and use the message box in the sidebar. You need a free account to send the first message; after that the thread lives in your inbox and replies arrive in real time while you have the site open.",
  },
  {
    question: "What does boosting actually do?",
    answer: `A boosted ad sits above the organic results in its sector's listing and search pages for the whole period you buy. Boosts come in ${tierLabels}, starting at ৳${formatAmount(cheapestBoost.priceBdt)}, paid by bKash, Nagad or card, and activate automatically once the payment succeeds.`,
  },
  {
    question: "Can I list my own property?",
    answer:
      "Yes. Any account can be upgraded to an advertiser account for free, and you can then post listings, edit the price, mark a property sold or rented, and open per-ad statistics showing impressions, visits and how many people registered to contact you.",
  },
  {
    question: "What if a listing looks fake?",
    answer:
      "Every ad is read by a moderator before it is published, and the team can take a live ad down at any point if it turns out to be a scam or has already gone. Whatever the listing says, visit the property in person and check the ownership papers before you pay any advance — we never handle money between you and an advertiser.",
  },
];

export function HomeFaq() {
  return (
    <section aria-labelledby="faq-heading" className="shell py-16 sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="eyebrow text-subtle-foreground">Questions</p>
          <h2
            id="faq-heading"
            className="font-heading text-title text-neutral-900"
          >
            Before you start
          </h2>
        </div>

        {/* Native <details> so the accordion works with the keyboard, with a
         * screen reader, and before any JavaScript arrives. */}
        <div className="flex flex-col gap-2.5">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl bg-card shadow-sm ring-1 ring-neutral-900/5 transition-shadow duration-200 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
                <span className="flex-1 font-heading text-base font-bold tracking-tight text-foreground">
                  {faq.question}
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-neutral-600 transition-[background-color,color,transform] duration-200 group-hover:bg-brand-100 group-hover:text-brand-800 group-open:rotate-180"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="measure px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
