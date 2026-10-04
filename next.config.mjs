const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/swipesense';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  ...(basePath
    ? {
        async redirects() {
          return [
            {
              source: '/',
              destination: basePath,
              basePath: false,
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
