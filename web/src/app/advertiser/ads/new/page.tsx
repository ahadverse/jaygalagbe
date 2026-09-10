import type { Metadata } from "next";
import { AdForm } from "@/components/advertiser/ad-form";

export const metadata: Metadata = {
  title: "Post a new ad | Jayga Lagbe",
};

export default function NewAdPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Post a new ad</h1>
      <AdForm />
    </main>
  );
}
