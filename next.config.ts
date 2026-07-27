import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

// Content-Security-Policy NÃO é definida aqui: o nonce muda a cada request,
// então ela é montada dinamicamente em src/proxy.ts (fonte única de verdade
// para o CSP). Definir CSP aqui de novo duplicaria o header e o navegador
// passaria a aplicar a interseção das duas políticas — quebrando o nonce.
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
