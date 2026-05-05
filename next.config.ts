import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'static.inaturalist.org',
      },
      {
        protocol: 'https',
        hostname: 'inaturalist-open-data.s3.amazonaws.com',
      },
    ],
  },
  async redirects() {
    return [
      // Duplicate plants EN → canonical slug (permanent 301)
      { source: '/plants/aglaonema-red',             destination: '/plants/chinese-evergreen',        permanent: true },
      { source: '/plants/alocasia-dragon-scale',     destination: '/plants/alocasia-silver-dragon',   permanent: true },
      { source: '/plants/pothos-neon',               destination: '/plants/golden-pothos',            permanent: true },
      { source: '/plants/pothos-marble-queen',       destination: '/plants/golden-pothos',            permanent: true },
      { source: '/plants/pothos-jade',               destination: '/plants/golden-pothos',            permanent: true },
      { source: '/plants/monstera-thai-constellation', destination: '/plants/monstera-deliciosa',     permanent: true },
      { source: '/plants/syngonium-podophyllum',     destination: '/plants/syngonium-pink',           permanent: true },
      // Duplicate plants ES → canonical slug
      { source: '/es/plants/aglaonema-red',          destination: '/es/plants/chinese-evergreen',     permanent: true },
      { source: '/es/plants/alocasia-dragon-scale',  destination: '/es/plants/alocasia-silver-dragon', permanent: true },
      { source: '/es/plants/pothos-neon',            destination: '/es/plants/golden-pothos',         permanent: true },
      { source: '/es/plants/pothos-marble-queen',    destination: '/es/plants/golden-pothos',         permanent: true },
      { source: '/es/plants/pothos-jade',            destination: '/es/plants/golden-pothos',         permanent: true },
      { source: '/es/plants/monstera-thai-constellation', destination: '/es/plants/monstera-deliciosa', permanent: true },
      { source: '/es/plants/syngonium-podophyllum',  destination: '/es/plants/syngonium-pink',        permanent: true },
    ];
  },
};

export default nextConfig;
