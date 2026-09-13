import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account | Jayga Lagbe",
};

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const perks = [
  "Message advertisers directly",
  "Save listings you like",
  "Post your own ads any time",
];

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const resolved = await searchParams;

  return (
    <main className="grain relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-background px-5 py-14 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col gap-2 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Free forever. Takes less than a minute.
          </p>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-lg ring-1 ring-neutral-900/5 sm:p-7">
          <RegisterForm
            from={firstValue(resolved?.from)}
            visitId={firstValue(resolved?.visitId)}
          />
        </div>

        <ul className="mt-6 flex flex-col gap-2.5">
          {perks.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-4 shrink-0 text-success-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 8.5 3.2 3.2L13 5" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
