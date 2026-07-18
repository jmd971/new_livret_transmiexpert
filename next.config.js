/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    // pdfkit lit ses métriques de polices (.afm) sur le disque au runtime ; il doit rester
    // un module externe (non bundlé) et ses fichiers data doivent être tracés dans le
    // déploiement serverless — sinon : « ENOENT Helvetica.afm » sur Vercel.
    serverComponentsExternalPackages: ['pdfkit'],
    outputFileTracingIncludes: {
      '/api/pdf/generate': ['./node_modules/pdfkit/js/data/**'],
    },
  },
};
module.exports = nextConfig;
