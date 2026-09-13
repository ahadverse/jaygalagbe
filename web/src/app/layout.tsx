import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentUser } from "@/lib/auth/session";
import { ToastProvider } from "@/lib/toast/toast-context";
import "./globals.css";

/*
 * Bricolage carries headlines, prices, and numbers — it has enough character
 * at display sizes to stop the site reading as a default template. Inter does
 * every other job because transliterated Bangla place names live in dense
 * metadata rows, and Inter stays legible there at 12–14px.
 */
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const text = Inter({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jayga Lagbe",
  description: "Find land and rental listings near you.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <SiteHeader user={user} />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
