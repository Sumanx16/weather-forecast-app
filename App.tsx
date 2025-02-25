import React, { useState, useEffect } from 'react';
import { Search, Compass, Cloud, Droplets, Wind } from 'lucide-react';
import axios from 'axios';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

interface ForecastItem {
  dt_txt: string;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

interface ForecastData {
  list: ForecastItem[];
}

function App() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  async function fetchWeather() {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`),
        axios.get(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`)
      ]);

      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
    } catch (err) {
      setError('City not found or API error. Please try again.');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather();
  }, []);

  const backgroundImage = weather?.weather[0].main.toLowerCase().includes('clear')
    ? 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80'
    : weather?.weather[0].main.toLowerCase().includes('cloud')
    ? 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80'
    : weather?.weather[0].main.toLowerCase().includes('rain')
    ? 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80'
    : 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920&q=80';

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '2rem'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Compass className="text-white w-8 h-8 mr-2" />
          <h1 className="text-3xl font-bold text-white">Weather Forecast by Suman</h1>
        </div>

        {/* Search */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            fetchWeather();
          }} 
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="search-input"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white"
              disabled={loading}
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto bg-red-500/80 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Current Weather */}
            {weather && (
              <div className="weather-card mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold">{weather.name}</h2>
                    <p className="text-6xl font-bold my-4">
                      {Math.round(weather.main.temp)}°C
                    </p>
                    <p className="text-xl capitalize">{weather.weather[0].description}</p>
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].description}
                    className="w-32 h-32"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="weather-stat">
                    <Droplets className="text-sky-300 mb-2" />
                    <span>Humidity</span>
                    <span className="text-xl font-bold">{weather.main.humidity}%</span>
                  </div>
                  <div className="weather-stat">
                    <Wind className="text-teal-300 mb-2" />
                    <span>Wind</span>
                    <span className="text-xl font-bold">{weather.wind.speed} m/s</span>
                  </div>
                  <div className="weather-stat">
                    <Cloud className="text-purple-300 mb-2" />
                    <span>Feels Like</span>
                    <span className="text-xl font-bold">{Math.round(weather.main.feels_like)}°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {forecast && (
              <div className="weather-card">
                <h3 className="text-2xl font-bold mb-6">5-Day Forecast</h3>
                <div className="grid grid-cols-5 gap-4">
                  {forecast.list
                    .filter((_, index) => index % 8 === 0)
                    .slice(0, 5)
                    .map((day) => (
                      <div key={day.dt_txt} className="forecast-day">
                        <span className="block font-medium mb-2">
                          {new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <img
                          src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                          alt={day.weather[0].description}
                          className="w-16 h-16 mx-auto"
                        />
                        <span className="block text-2xl font-bold">
                          {Math.round(day.main.temp)}°C
                        </span>
                        <span className="block text-sm opacity-80">
                          {day.weather[0].description}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;