/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig

module.exports = {
  images: {
    domains: ['localhost','bookstore-image-1jz3.s3.ap-southeast-1.amazonaws.com'],
  },
  env: {
    BACKEND: 'http://localhost:5000',
    AWS_S3_ACCESS_KEY_ID: 'AKIAYOK47XPQ3HVBESOD',
    AWS_S3_SECRET_ACCESS_KEY: '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',
    AWS_S3_REGION: 'ap-southeast-1',
    AWS_S3_BUCKET_NAME: 'bookstore-image-1jz3',
    AWS_S3_URL: 'https://bookstore-image-1jz3.s3.ap-southeast-1.amazonaws.com',
  }
}
