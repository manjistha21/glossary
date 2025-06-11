/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        // Disable Webpack cache for troubleshooting serialization warnings
        config.cache = false;

        return config;
    },
};

module.exports = nextConfig;
