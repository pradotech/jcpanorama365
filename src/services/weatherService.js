/**
 * Serviço de previsão do tempo integrado à Open-Meteo (API gratuita, sem necessidade de chave).
 * Coordenadas padrão: Jundiaí - SP (-23.1857, -46.8978)
 * Suporte à previsão atual e dos 7 dias da semana.
 * Documentação: https://open-meteo.com/en/docs
 */

const DEFAULT_COORDS = {
  city: 'Jundiaí, SP',
  latitude: -23.1857,
  longitude: -46.8978,
};

const STORAGE_KEY = 'jc_weather_cache_v2';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas de cache para o clima

// Mapeamento dos códigos WMO da Open-Meteo para descrições em português
const WMO_CODES = {
  0: { label: 'Céu limpo', icon: 'sun' },
  1: { label: 'Predominantemente limpo', icon: 'sun-cloud' },
  2: { label: 'Parcialmente nublado', icon: 'cloud-sun' },
  3: { label: 'Nublado', icon: 'cloud' },
  45: { label: 'Nevoeiro', icon: 'fog' },
  48: { label: 'Nevoeiro com geada', icon: 'fog' },
  51: { label: 'Garoa leve', icon: 'drizzle' },
  53: { label: 'Garoa moderada', icon: 'drizzle' },
  55: { label: 'Garoa densa', icon: 'drizzle' },
  61: { label: 'Chuva fraca', icon: 'rain' },
  63: { label: 'Chuva moderada', icon: 'rain' },
  65: { label: 'Chuva forte', icon: 'rain-heavy' },
  80: { label: 'Pancadas de chuva', icon: 'rain' },
  81: { label: 'Pancadas moderadas', icon: 'rain' },
  82: { label: 'Chuva torrencial', icon: 'rain-heavy' },
  95: { label: 'Tempestade com trovoadas', icon: 'thunder' },
  96: { label: 'Tempestade com granizo', icon: 'thunder' },
  99: { label: 'Tempestade severa', icon: 'thunder' },
};

function generateFallbackForecast() {
  const days = ['Hoje', 'Amanhã', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg'];
  return days.map((dayLabel, i) => ({
    dayLabel,
    tempMax: 27 + (i % 3),
    tempMin: 18 - (i % 2),
    rainProbability: 20 + (i * 10) % 50,
    iconType: i % 2 === 0 ? 'sun' : 'cloud-sun',
    condition: i % 2 === 0 ? 'Céu limpo' : 'Parcialmente nublado',
  }));
}

const FALLBACK_WEATHER = {
  city: 'Jundiaí, SP',
  temperature: 24,
  apparentTemperature: 25,
  tempMax: 28,
  tempMin: 18,
  humidity: 70,
  windSpeed: 11,
  rainProbability: 20,
  weatherCode: 2,
  condition: 'Parcialmente nublado',
  iconType: 'cloud-sun',
  isDay: true,
  forecast: generateFallbackForecast(),
  updatedAt: new Date().toISOString(),
};

function getFromCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      return parsed.data;
    }
  } catch {
    // ignora
  }
  return null;
}

function saveToCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // ignora
  }
}

/**
 * Busca previsão do tempo atual e dos 7 dias da semana na Open-Meteo
 */
export async function fetchWeatherData(coords = DEFAULT_COORDS) {
  const cached = getFromCache();
  if (cached) {
    return cached;
  }

  try {
    const params = new URLSearchParams({
      latitude: coords.latitude.toString(),
      longitude: coords.longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'America/Sao_Paulo',
      forecast_days: '7',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na Open-Meteo (${response.status})`);
    }

    const data = await response.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const code = current.weather_code ?? 0;
    const wmoInfo = WMO_CODES[code] || { label: 'Tempo estável', icon: 'sun' };

    // Monta a lista da semana (próximos 5 a 6 dias além de hoje)
    const timeList = daily.time || [];
    const forecast = timeList.map((dateStr, i) => {
      let dayLabel = 'Hoje';
      if (i === 1) {
        dayLabel = 'Amanhã';
      } else if (i > 1) {
        try {
          const d = new Date(`${dateStr}T12:00:00`);
          const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          dayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        } catch {
          dayLabel = `Dia ${i + 1}`;
        }
      }

      const dayCode = daily.weather_code?.[i] ?? 0;
      const dayWmo = WMO_CODES[dayCode] || { label: 'Estável', icon: 'sun' };

      return {
        date: dateStr,
        dayLabel,
        isToday: i === 0,
        tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 26),
        tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 18),
        rainProbability: Math.round(daily.precipitation_probability_max?.[i] ?? 10),
        weatherCode: dayCode,
        condition: dayWmo.label,
        iconType: dayWmo.icon,
      };
    });

    const formatted = {
      city: coords.city,
      temperature: Math.round(current.temperature_2m ?? 24),
      apparentTemperature: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 24),
      tempMax: Math.round(daily.temperature_2m_max?.[0] ?? (current.temperature_2m + 4)),
      tempMin: Math.round(daily.temperature_2m_min?.[0] ?? (current.temperature_2m - 4)),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      rainProbability: Math.round(daily.precipitation_probability_max?.[0] ?? 15),
      weatherCode: code,
      condition: wmoInfo.label,
      iconType: wmoInfo.icon,
      isDay: Boolean(current.is_day ?? 1),
      forecast,
      updatedAt: new Date().toISOString(),
    };

    saveToCache(formatted);
    return formatted;
  } catch (error) {
    console.warn('Aviso: erro ao carregar clima da Open-Meteo, utilizando dados seguros:', error.message);
    return FALLBACK_WEATHER;
  }
}
