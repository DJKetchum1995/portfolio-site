const weatherCity = document.getElementById('weather-city');
const weatherIcon = document.getElementById('weather-icon');
const weatherTemp = document.getElementById('weather-temp');
const weatherCondition = document.getElementById('weather-condition');
const weatherForecast = document.getElementById('weather-forecast');

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌨️';
  if (code <= 77) return '🌨️';
  if (code <= 86) return '🌤️';
  return '🌦️';
}

function getWeatherCondition(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Mostly clear';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Rain';
  if (code <= 67) return 'Snow';
  if (code <= 77) return 'Snow grains';
  if (code <= 86) return 'Thunderstorms';
  return 'Mixed conditions';
}

function formatDateLabel(dateString, index) {
  const date = new Date(dateString);
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function renderForecast(days) {
  const items = days.map((day, index) => {
    const label = formatDateLabel(day.time, index);
    const high = Math.round(day.temperature_2m_max);
    const low = Math.round(day.temperature_2m_min);
    return `<div class="forecast-day"><span>${label}</span><strong>${high}° / ${low}°</strong></div>`;
  });

  weatherForecast.innerHTML = items.join('');
}

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  });
}

function getFallbackLocation() {
  return fetch('https://geolocation-db.com/json/')
    .then((response) => response.json())
    .then((data) => ({
      latitude: data.latitude,
      longitude: data.longitude,
      state: data.state || data.city || 'your area'
    }))
    .catch(() => ({
      latitude: 40.7128,
      longitude: -74.006,
      state: 'your area'
    }));
}

function updateWeather(latitude, longitude, label = 'your area') {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=4`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const temp = Math.round(data.current.temperature_2m);
      const code = data.current.weather_code;

      weatherCity.textContent = label;
      weatherIcon.textContent = getWeatherEmoji(code);
      weatherTemp.textContent = `${temp}°F`;
      weatherCondition.textContent = getWeatherCondition(code);
      renderForecast(data.daily || []);
    })
    .catch(() => {
      weatherCity.textContent = label;
      weatherIcon.textContent = '🌤️';
      weatherTemp.textContent = '--°F';
      weatherCondition.textContent = 'Weather data unavailable';
      renderForecast([]);
    });
}

function fallbackWeather() {
  weatherCity.textContent = 'Your state';
  weatherIcon.textContent = '🌤️';
  weatherTemp.textContent = '--°F';
  weatherCondition.textContent = 'Enable location to see your weather.';
  weatherForecast.innerHTML = '<div class="forecast-day"><span>Today</span><strong>-- / --</strong></div><div class="forecast-day"><span>Tomorrow</span><strong>-- / --</strong></div><div class="forecast-day"><span>+2</span><strong>-- / --</strong></div><div class="forecast-day"><span>+3</span><strong>-- / --</strong></div>';
}

getBrowserLocation()
  .then((coords) => {
    updateWeather(coords.latitude, coords.longitude, 'Your state');
  })
  .catch(() => {
    getFallbackLocation()
      .then((location) => {
        updateWeather(location.latitude, location.longitude, location.state);
      })
      .catch(() => {
        fallbackWeather();
      });
  });
