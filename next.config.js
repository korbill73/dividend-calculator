/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // <--- 이 줄이 핵심입니다! (쉼표 필수)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // 이미지 에러 방지용 (추천)
  }
};

export default nextConfig;
