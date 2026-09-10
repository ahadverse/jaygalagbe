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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Log in
      </h1>
      <LoginForm
        from={firstValue(resolved?.from)}
        visitId={firstValue(resolved?.visitId)}
      />
    </main>
  );
}
