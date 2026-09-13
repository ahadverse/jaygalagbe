import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in | Jayga Lagbe",
};

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const resolved = await searchParams;

  return (
    <main className="grain relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-background px-5 py-14 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col gap-2 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Log in to message advertisers and manage your listings.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-lg ring-1 ring-neutral-900/5 sm:p-7">
          <LoginForm
            from={firstValue(resolved?.from)}
            visitId={firstValue(resolved?.visitId)}
          />
        </div>
      </div>
    </main>
  );
}
