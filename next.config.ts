import type { NextConfig } from "next";

const remotePatterns: Array<{
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}> = [];

const publicR2Url = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
if (publicR2Url) {
  try {
    const parsed = new URL(publicR2Url);
    const normalizedPath = parsed.pathname.replace(/\/$/, "");
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      pathname: `${normalizedPath || ""}/**`,
    });
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL:', error);
  }
}

remotePatterns.push(
  { protocol: "https", hostname: "**.r2.dev", pathname: "/**" },
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com", pathname: "/**" },
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
