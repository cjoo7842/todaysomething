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
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn(
          "OpenWeatherMap API Key (NEXT_PUBLIC_OPENWEATHER_API_KEY) is missing. Using fallback weather data (Seoul, 22°C, Clear)."
        );
        setLoading(false);
        return;
      }

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric&lang=kr`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Weather API request failed with status ${res.status}`);
        }
        const data = await res.json();

        const mainCondition = data.weather[0]?.main || "Clear";
        const weatherId = data.weather[0]?.id || 800;
        const description = data.weather[0]?.description || "맑음";

        // 2xx (Thunderstorm), 3xx (Drizzle), 5xx (Rain) -> 비/강수
        const isRainy =
          (weatherId >= 200 && weatherId < 600) ||
          mainCondition === "Rain" ||
          mainCondition === "Drizzle" ||
          mainCondition === "Thunderstorm";
        // 6xx (Snow) -> 눈
        const isSnowy = (weatherId >= 600 && weatherId < 700) || mainCondition === "Snow";
        // 80x (Clouds) -> 구름/흐림
        const isCloudy = (weatherId > 800 && weatherId < 900) || mainCondition === "Clouds";

        // 이모지 매핑
        let icon = "☀️";
        if (isRainy) icon = "☔";
        else if (isSnowy) icon = "❄️";
        else if (isCloudy) icon = "☁️";
        else if (weatherId >= 700 && weatherId < 800) icon = "🌫️"; // 안개 등

        setWeather({
          temp: Math.round(data.main.temp),
          condition: mainCondition,
          isRainy: isRainy || isSnowy,
          isCloudy,
          description,
          icon,
        });
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
