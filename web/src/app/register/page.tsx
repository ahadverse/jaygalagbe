import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account | Jayga Lagbe",
};

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const resolved = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Create your account
      </h1>
      <RegisterForm
        from={firstValue(resolved?.from)}
        visitId={firstValue(resolved?.visitId)}
      />
    </main>
  );
}
