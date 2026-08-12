import type { Config } from "tailwindcss";

// 컬러 값은 docs/디자인가이드.md의 "2. 컬러 시스템"을 그대로 반영했습니다.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f97316", // Orange-500 (Primary)
          dark: "#ea580c", // Orange-600 (hover)
          light: "#fed7aa", // Orange-200 (배경 강조용)
        },
        rose: {
          accent: "#fb7185", // Rose-400 (Secondary)
        },
        teal: {
          accent: "#14b8a6", // Teal-500 (지도/위치 포인트)
        },
        surface: "#fafaf9", // Neutral-50 배경
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
