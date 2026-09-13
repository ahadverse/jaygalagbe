import type { Metadata } from "next";
import { AdForm } from "@/components/advertiser/ad-form";

export const metadata: Metadata = {
  title: "Post a new ad | Jayga Lagbe",
};

export default function NewAdPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-brand-700">New listing</p>
        <h1 className="font-heading text-title text-neutral-900">
          Post a new ad
        </h1>
        <p className="measure text-sm text-muted-foreground">
          Fill in the details below. Our team checks every listing before it
          goes live, which usually takes less than a day.
        </p>
      </header>
      <AdForm />
    </main>
  );
}
