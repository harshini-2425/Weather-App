import React, { useState } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import humidity_icon from '../assets/humidity.png'

const Weather = () => {
    const [city, setCity] = useState('')
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const getWeatherIcon = (weatherCode) => {
        // WMO Weather interpretation codes
        if (weatherCode === 0 || weatherCode === 1) return clear_icon // Clear
        if (weatherCode === 2 || weatherCode === 3) return cloud_icon // Partly cloudy
        if (weatherCode === 45 || weatherCode === 48) return cloud_icon // Foggy
        if (weatherCode >= 51 && weatherCode <= 67) return drizzle_icon // Drizzle
        if (weatherCode >= 71 && weatherCode <= 77) return snow_icon // Snow
        if (weatherCode >= 80 && weatherCode <= 82) return rain_icon // Rain showers
        if (weatherCode >= 85 && weatherCode <= 86) return snow_icon // Snow showers
        if (weatherCode >= 80 && weatherCode <= 99) return rain_icon // Thunderstorm
        return clear_icon
    }

    const searchWeather = async (cityName) => {
        if (!cityName.trim()) {
            setError('Please enter a city name')
            return
        }

        setLoading(true)
        setError('')

        try {
            // First, geocode the city name to get coordinates
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
            )
            const geoData = await geoResponse.json()

            if (!geoData.results || geoData.results.length === 0) {
                setError('City not found. Please try another name.')
                setLoading(false)
                return
            }

            const { latitude, longitude, name, country } = geoData.results[0]

            // Get weather data using coordinates
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius`
            )
            const weatherData = await weatherResponse.json()

            setWeather({
                city: name,
                country: country,
                temperature: Math.round(weatherData.current.temperature_2m),
                humidity: weatherData.current.relative_humidity_2m,
                windSpeed: Math.round(weatherData.current.wind_speed_10m),
                weatherCode: weatherData.current.weather_code
            })
        } catch (err) {
            setError('Failed to fetch weather data. Please try again.')
            console.error(err)
        }

        setLoading(false)
    }

    const handleSearch = () => {
        searchWeather(city)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchWeather(city)
        }
    }

    return (
        <div className='weather'>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search city..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <img src={search_icon} alt="search" onClick={handleSearch} />
            </div>

            {error && <p className='error'>{error}</p>}
            {loading && <p className='loading'>Loading...</p>}

            {weather && (
                <>
                    <img src={getWeatherIcon(weather.weatherCode)} alt="weather" className='weather_icon' />
                    <p className='temperature'>{weather.temperature}°C</p>
                    <p className='location'>{weather.city}, {weather.country}</p>
                    <div className='weather-details'>
                        <div className='detail-item'>
                            <img src={humidity_icon} alt="humidity" />
                            <div>
                                <p>{weather.humidity}%</p>
                                <span>Humidity</span>
                            </div>
                        </div>
                        <div className='detail-item'>
                            <img src={wind_icon} alt="wind" />
                            <div>
                                <p>{weather.windSpeed} km/h</p>
                                <span>Wind Speed</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Weather