/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/swipesense',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/swipesense',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

