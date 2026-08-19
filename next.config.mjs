/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // MVP 단계: 서울시 API/외부 썸네일 도메인이 아직 확정되지 않아 임시로 전체 허용합니다.
    // 실제 API 연동 후에는 remotePatterns를 실제 이미지 도메인으로 좁혀주세요.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "tong.visitkorea.or.kr",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;
