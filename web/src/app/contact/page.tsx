import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { SITE_CONTACT } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Contact Us | Jayga Lagbe",
  description:
    "Questions about a listing, your account or advertising on Jayga Lagbe? Send us a message and our team will reply.",
};

function Icon({ d }: { d: string }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </span>
  );
}

const channels = [
  {
    label: "Email",
    value: SITE_CONTACT.email,
    href: SITE_CONTACT.email ? `mailto:${SITE_CONTACT.email}` : "",
    icon: "M4 6h16v12H4zM4 7l8 6 8-6",
  },
  {
    label: "Phone",
    value: SITE_CONTACT.phone,
    href: SITE_CONTACT.phone
      ? `tel:${SITE_CONTACT.phone.replace(/[^+\d]/g, "")}`
      : "",
    icon: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2",
  },
  {
    label: "WhatsApp",
    value: SITE_CONTACT.whatsapp,
    href: SITE_CONTACT.whatsapp
      ? `https://wa.me/${SITE_CONTACT.whatsapp.replace(/\D/g, "")}`
      : "",
    icon: "M4 20l1.3-4.1A8 8 0 1 1 8.2 18.8L4 20Z",
  },
  {
    label: "Office",
    value: SITE_CONTACT.address,
    href: "",
    icon: "M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  },
  {
    label: "Hours",
    value: SITE_CONTACT.hours,
    href: "",
    icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
].filter((channel) => channel.value);

const faqs = [
  {
    q: "How do I contact an advertiser?",
    a: "Open the ad and choose Message advertiser. You'll need a free account, which keeps spam and fake enquiries out.",
  },
  {
    q: "How long does ad approval take?",
    a: "Every ad is reviewed by our team before it goes live. You can follow its status from your dashboard.",
  },
  {
    q: "I found a misleading listing. What should I do?",
    a: "Use the Report button on the ad, or send us the ad link here and we'll look into it.",
  },
];

const promises = [
  { value: "1 working day", label: "Typical reply time" },
  { value: "100%", label: "Ads manually reviewed" },
  { value: "Free", label: "To browse and enquire" },
  { value: "Bangladesh", label: "Listings nationwide" },
];

const audiences = [
  {
    title: "Buyers & renters",
    body: "Looking for land or a house to rent? We can help you find your way around, understand a listing, or report something that looks off.",
    points: ["Finding the right listing", "Contacting an advertiser", "Reporting a suspicious ad"],
  },
  {
    title: "Advertisers & owners",
    body: "Selling land or renting out a home? Get help posting, editing or boosting your ad so it reaches more people.",
    points: ["Posting and editing ads", "Boosting for more visibility", "Ad approval questions"],
  },
  {
    title: "Partners & media",
    body: "Agencies, developers, businesses and journalists are welcome to get in touch about partnerships and collaborations.",
    points: ["Business partnerships", "Bulk or agency listings", "Press and media enquiries"],
  },
];

const safetyTips = [
  "Visit the property in person and meet the owner before paying anything.",
  "Never send money in advance to someone you have not met.",
  "Verify ownership papers (deed, khatian, mutation) before buying land.",
  "Keep conversations on Jayga Lagbe so there is a record if something goes wrong.",
  "Report any ad that asks for advance payment or looks too good to be true.",
];

const steps = [
  { n: "1", title: "You send a message", body: "Tell us what you need using the form above." },
  { n: "2", title: "We review it", body: "A team member reads it and looks into your question." },
  { n: "3", title: "We reply to you", body: "You hear back by email or phone, usually within one working day." },
];

export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="grain relative overflow-hidden bg-gradient-to-b from-brand-50 to-background">
        <div className="shell py-14 text-center sm:py-20">
          <span className="eyebrow text-brand-700">Contact us</span>
          <h1 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            How can we help you?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Questions about a listing, your account or advertising with us?
            Send a message and our team will get back to you, usually within
            one working day.
          </p>
        </div>
      </section>

      <section className="shell pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl bg-card p-6 shadow-lg ring-1 ring-neutral-900/5 sm:p-8 lg:col-span-3">
            <h2 className="font-heading text-xl font-bold text-neutral-900">
              Send us a message
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              Fill in the form and we&apos;ll reply by email or phone.
            </p>
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-2">
            {channels.length > 0 && (
              <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5">
                <h2 className="font-heading text-lg font-bold text-neutral-900">
                  Reach us directly
                </h2>
                <ul className="mt-5 flex flex-col gap-5">
                  {channels.map((channel) => (
                    <li
                      key={channel.label}
                      className="flex items-center gap-3.5"
                    >
                      <Icon d={channel.icon} />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                          {channel.label}
                        </span>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className="break-words text-sm font-semibold text-foreground hover:text-brand-700"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-foreground">
                            {channel.value}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {SITE_CONTACT.mapUrl && (
                  <a
                    href={SITE_CONTACT.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline"
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5">
              <h2 className="font-heading text-lg font-bold text-neutral-900">
                Quick answers
              </h2>
              <dl className="mt-4 flex flex-col gap-4">
                {faqs.map((item) => (
                  <div key={item.q}>
                    <dt className="text-sm font-semibold text-foreground">
                      {item.q}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/dashboard/messages"
                className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline"
              >
                Go to my messages →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="shell grid grid-cols-2 gap-6 py-10 text-center lg:grid-cols-4">
          {promises.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="font-heading text-2xl font-bold text-brand-700 sm:text-3xl">
                {item.value}
              </span>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-16 sm:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-brand-700">Who we help</span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Whatever you need, we are here
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5"
            >
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                {audience.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {audience.body}
              </p>
              <ul className="mt-auto flex flex-col gap-2">
                {audience.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-foreground">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0 text-success-600" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-brand-50 to-background">
        <div className="shell py-16 sm:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow text-brand-700">What happens next</span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              From your message to our reply
            </h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-neutral-900/5">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-600 font-heading text-base font-bold text-white">
                  {step.n}
                </span>
                <h3 className="font-heading text-base font-bold text-neutral-900">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="safety-tips" className="shell scroll-mt-24 py-16 sm:py-20">
        <div className="grid items-start gap-8 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5 sm:p-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="eyebrow text-brand-700">Stay safe</span>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-neutral-900">
              Tips for safer property deals
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Most deals go smoothly, but a little caution protects you. If
              something feels wrong, tell us.
            </p>
            <Link
              href="/jayga-jomi"
              className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline"
            >
              Browse reviewed listings →
            </Link>
          </div>
          <ul className="flex flex-col gap-3 lg:col-span-3">
            {safetyTips.map((tip) => (
              <li key={tip} className="flex gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
