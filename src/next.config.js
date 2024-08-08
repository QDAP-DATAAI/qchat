// @ts-check

/**
 * @type {import('next').NextConfig}
 **/

const securityHeaders = [
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Powered-By",
    value: "Queensland Government",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src https://www.google-analytics.com 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://ssl.google-analytics.com https://ajax.googleapis.com; style-src *.typekit.net 'self' 'unsafe-inline'; frame-ancestors 'self'; img-src 'self' https://www.google-analytics.com https://www.google.com https://www.google.com.au https://www.googletagmanager.com data:; font-src *.typekit.net 'self' data:; connect-src 'self' https://www.google.com.au/ads https://js.monitor.azure.com https://qdap-dev-apim.azure-api.net https://qdap-prd-apim.developer.azure-api.net *.ai.qld.gov.au *.applicationinsights.azure.com https://australiaeast.livediagnostics.monitor.azure.com https://analytics.google.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.googleapis.com https://tagmanager.google.com; media-src 'self'; frame-src 'self' https://www.googletagmanager.com https://www.google.com https://tagmanager.google.com; object-src 'none'; upgrade-insecure-requests",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), clipboard-read=(self), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(self), usb=(), xr-spatial-tracking=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "X-Download-Options",
    value: "noopen",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "require-corp",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
]

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  devIndicators: {
    buildActivityPosition: "bottom-right",
  },
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: ["tailwind-merge", "applicationinsights", "react", "react-dom", "azure/cosmos"],
    serverActions: {
      allowedOrigins: ["*.ai.qld.gov.au", "qggptprodopenai.azurewebsites.net", "qggptdevopenai.azurewebsites.net"],
    },
  },
  // eslint-disable-next-line require-await

  redirects() {
    return [
      {
        source: "/chatai",
        destination: "/chat",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/api/auth/signin/azure-ad",
        permanent: true,
      },
      {
        source: "/logout",
        destination: "/api/auth/signout",
        permanent: true,
      },
      {
        source: "/support",
        destination: "https://dis-qgcdg.atlassian.net/servicedesk/customer/portal/2",
        permanent: true,
      },
    ]
  },
  // eslint-disable-next-line require-await

  headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/pattern.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
