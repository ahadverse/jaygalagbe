import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:5000";

// Ad photos are posted to our own API, which stores them in S3, so the
// browser never opens a connection to the bucket and `connect-src` does not
// need to allow it. Photos are only ever *displayed* from the CDN, which
// `img-src https:` already covers.

// Next injects inline bootstrap scripts and Tailwind emits inline styles, so
// those two directives stay permissive; everything else is locked to self.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${wsUrl} ${wsUrl.replace(/^http/, "ws")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // Customers and advertisers now share one dashboard; the old advertiser-only
  // URLs keep working for anyone holding a bookmark or a link in an email.
  redirects: async () => [
    { source: "/advertiser", destination: "/dashboard/ads", permanent: true },
    {
      source: "/advertiser/messages",
      destination: "/dashboard/messages",
      permanent: true,
    },
    {
      source: "/advertiser/ads/:path*",
      destination: "/dashboard/ads/:path*",
      permanent: true,
    },
  ],
};

export default nextConfig;
