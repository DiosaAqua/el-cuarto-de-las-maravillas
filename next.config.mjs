/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' deja un build autocontenido para hosting tipo cPanel/Passenger.
  // En Netlify, el runtime de Next arma su propio output — no forzar standalone ahí.
  output: process.env.NETLIFY ? undefined : 'standalone',
  images: { unoptimized: true }, // las fotos se sirven desde /uploads, sin optimizador
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
};
export default nextConfig;
