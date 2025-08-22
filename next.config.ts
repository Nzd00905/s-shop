
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to solve a warnign from handlebars which is a dependency of genkit.
    // "require.extensions is not supported by webpack. Use a loader instead."
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.handlebars$/,
          loader: 'handlebars-loader',
        },
      ],
    };

    // This is to solve a warning from genkit:
    // "Module not found: Can't resolve '@opentelemetry/exporter-jaeger'"
    // "Module not found: Can't resolve '@genkit-ai/firebase'"
    // We are aliasing them to false to indicate that they are not available.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/exporter-jaeger': false,
        '@genkit-ai/firebase': false,
      };
    }
    return config;
  },
};

export default nextConfig;
