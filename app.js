const weatherCity = document.getElementById('weather-city');
const weatherIcon = document.getElementById('weather-icon');
const weatherTemp = document.getElementById('weather-temp');
const weatherCondition = document.getElementById('weather-condition');

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤️';
  if (code <= 45) return '🌥️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌨️';
  if (code <= 77) return '🌨️';
  if (code <= 86) return '⛈️';
  return '🌦️';
}

function getWeatherLabel(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Mostly clear';
  if (code <= 45) return 'Cloudy';
  if (code <= 57) return 'Rain';
  if (code <= 67) return 'Snow';
  if (code <= 77) return 'Snow grains';
  if (code <= 86) return 'Stormy';
  return 'Mixed conditions';
}

function setWeatherFallback(message) {
  weatherCity.textContent = 'Your location';
  weatherIcon.textContent = '🌤️';
  weatherTemp.textContent = '--°F';
  weatherCondition.textContent = message;
}

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => reject(new Error('Location denied')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  });
}

function getFallbackLocation() {
  return fetch('https://ipapi.co/json/')
    .then((response) => response.json())
    .then((data) => ({
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || data.region || 'your area'
    }))
    .catch(() => ({
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York'
    }));
}

function getCityName(latitude, longitude) {
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {
    headers: {
      'Accept-Language': 'en'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.hamlet || address.suburb || address.county || 'Your location';
      const state = address.state || address.region || '';
      return state ? `${city}, ${state}` : city;
    })
    .catch(() => 'Your location');
}

function updateWeather(latitude, longitude, fallbackLabel) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const temp = Math.round(data.current.temperature_2m);
      const code = data.current.weather_code;

      return getCityName(latitude, longitude).then((city) => {
        weatherCity.textContent = city || fallbackLabel;
        weatherIcon.textContent = getWeatherEmoji(code);
        weatherTemp.textContent = `${temp}°F`;
        weatherCondition.textContent = getWeatherLabel(code);
      });
    })
    .catch(() => {
      setWeatherFallback('Weather is unavailable right now.');
    });
}

async function loadWeather() {
  try {
    const coords = await getBrowserLocation();
    updateWeather(coords.latitude, coords.longitude, 'Your location');
  } catch (error) {
    try {
      const fallback = await getFallbackLocation();
      updateWeather(fallback.latitude, fallback.longitude, fallback.city);
    } catch {
      setWeatherFallback('Enable location to see your weather.');
    }
  }
}

loadWeather();
