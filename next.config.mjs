/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'assets.leetcode.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'userpic.codeforces.org',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.codeforces.com',
                port: '',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
