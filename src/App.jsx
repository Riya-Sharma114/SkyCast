import React, { useState, useEffect } from "react";
import WeatherBackground from "./components/WeatherBackground.jsx";

// Dummy Icons (replace with real ones if you want)
const Icon = () => <span className="text-xl">🌦️</span>;
const HumidityIcon = Icon;
const WindIcon = Icon;
const VisibilityIcon = Icon;
const SunriseIcon = Icon;
const SunsetIcon = Icon;

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");

  const API_KEY = "ecb10ef941125a42b540652f927351f0";

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestions(city), 500);
      return () => clearTimeout(timer);
    }
    setSuggestions([]);
  }, [city, weather]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error();
      setSuggestions(await res.json());
    } catch {
      setSuggestions([]);
    }
  };

  const fetchWeatherData = async (url, name = "") => {
    setError("");
    setWeather(null);

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error((await response.json()).message || "City not found");

      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
      setSuggestions([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return setError("Please enter a valid city name.");
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`
    );
  };

  const convertTemperature = (temp, unit) =>
    unit === "C" ? Math.round(temp) : Math.round(temp * 1.8 + 32);

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 >= weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <div className="min-h-screen">
      <WeatherBackground condition={getWeatherCondition()} />

      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-transparent backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md w-full border border-white/30 text-white">

          <h1 className="text-4xl font-extrabold text-center mb-6">SkyCast</h1>

          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative gap-4">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City or Country (min 3 letters)"
                className="p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300"
              />

              {suggestions.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-black/60 rounded z-10">
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat}-${s.lon}`}
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                          `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                        )
                      }
                      className="block w-full text-left px-4 py-2 hover:bg-blue-700"
                    >
                      {s.name}, {s.country}
                    </button>
                  ))}
                </div>
              )}

              <button className="bg-purple-700 hover:bg-blue-700 py-2 rounded">
                Get Weather
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <button
                onClick={() => {
                  setWeather(null);
                  setCity("");
                }}
                className="bg-purple-900 px-3 py-1 rounded"
              >
                New Search
              </button>

              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">{weather.name}</h2>
                <button
                  onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
                  className="bg-blue-700 px-3 py-1 rounded"
                >
                  °{unit}
                </button>
              </div>

              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt=""
                className="mx-auto"
              />

              <p className="text-4xl">
                {convertTemperature(weather.main.temp, unit)}°{unit}
              </p>

              <p className="capitalize">{weather.weather[0].description}</p>
            </div>
          )}

          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;
