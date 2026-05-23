import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === "development";

// pega da env
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              "img-src 'self' data: blob: https:",

              "font-src 'self' https://fonts.gstatic.com data:",

              isDev
                ? `connect-src 'self' https: http://localhost:* ${API_URL}`
                : `connect-src 'self' https: ${API_URL}`,

              "frame-ancestors 'none'",
            ].join("; "),
          },

          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
