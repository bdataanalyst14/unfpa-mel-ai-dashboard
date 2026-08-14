/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/*': ['./.vercel-runtime/bigquery-readiness-manifest.json'],
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
    workerThreads: true,
  },
};

module.exports = nextConfig;
