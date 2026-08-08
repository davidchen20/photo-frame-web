/** @type {import('next').NextModel} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Adjust this limit as needed (e.g., '10mb', '20mb')
    },
  },
};

module.exports = nextConfig;