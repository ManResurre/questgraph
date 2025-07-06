/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        outputFileTracing: true,
        optimizePackageImports: [
            '@react-three/fiber',
            'three',
            'react-dnd',
            'dnd-core',
            '@radix-ui/react-icons'
        ]
    },
    poweredByHeader: false,
    generateEtags: false,
    webpack: (config, {isServer}) => {
        if (isServer) {
            // Уменьшаем размер серверного бандла
            config.optimization.splitChunks = false;
            config.optimization.minimize = true;

            // Исключаем тяжелые модули
            config.externals = config.externals || [];
            config.externals.push(({context, request}, callback) => {
                if (/^@?(aws-sdk|sharp|bcrypt|canvas|puppeteer)/.test(request)) {
                    return callback(null, `commonjs ${request}`);
                }
                callback();
            });
        }
        return config;
    },
};

export default nextConfig;
