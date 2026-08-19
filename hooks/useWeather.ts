import { useState, useEffect } from "react";

export interface WeatherInfo {
  temp: number;
  condition: string;
  isRainy: boolean;
  isCloudy: boolean;
  description: string;
  icon: string;
}

const FALLBACK_WEATHER: WeatherInfo = {
  temp: 22,
  condition: "Clear",
  isRainy: false,
  isCloudy: false,
  description: "맑음",
  icon: "☀️",
};

export function useWeather() {
  const [weather, setWeather] = useState<WeatherInfo>(FALLBACK_WEATHER);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/weather");
        if (!res.ok) {
          throw new Error(`Weather API request failed with status ${res.status}`);
        }
        const data = await res.json();
        
        // 만약 API 키가 설정되지 않아서 에러 메시지가 리턴되었다면 기존 FALLBACK 유지
        if (data.error) {
          throw new Error(data.error);
        }

        setWeather(data);
      } catch (err: any) {
        console.error("Failed to fetch weather data:", err);
        setError(err.message || "Unknown error");
        // 에러 발생 시 fallback 데이터 그대로 사용하도록 상태 유지
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading, error };
}
