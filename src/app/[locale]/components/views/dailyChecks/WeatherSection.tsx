'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Section } from '../../common'

interface WeatherData {
  current: {
    temp: number
    feelsLike: number
    humidity: number
    description: string
    icon: string
    windSpeed: number
    pressure: number
    visibility: number
  }
  forecast: Array<{
    date: string
    day: {
      temp: number | null
      tempMin: number | null
      tempMax: number | null
      description: string
      icon: string
    }
    night: {
      temp: number | null
      tempMin: number | null
      tempMax: number | null
      description: string
      icon: string
    }
    tempMin: number | null
    tempMax: number | null
  }>
}

const WeatherSection = () => {
  const t = useTranslations('DailyChecksPage.weather')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/weather')
        if (!res.ok) {
          throw new Error('Failed to fetch weather')
        }
        const data = await res.json()
        setWeather(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Section>
        <p className="text-gray-300">{t('loading')}</p>
      </Section>
    )
  }

  if (error || !weather) {
    return (
      <Section>
        <p className="text-red-400">{error || t('error')}</p>
      </Section>
    )
  }

  return (
    <Section>
      <h2 className="text-2xl font-bold text-gray-200 mb-4">{t('title')}</h2>

      {/* Current Weather */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
            alt={weather.current.description}
            className="w-20 h-20"
          />
          <div>
            <p className="text-3xl font-bold text-white">
              {Math.round(weather.current.temp)}°C
            </p>
            <p className="text-gray-300 capitalize">
              {weather.current.description}
            </p>
            <p className="text-sm text-gray-400">
              {t('feelsLike')} {Math.round(weather.current.feelsLike)}°C
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
          <div>
            <span className="text-gray-400">{t('humidity')}:</span>{' '}
            {weather.current.humidity}%
          </div>
          <div>
            <span className="text-gray-400">{t('windSpeed')}:</span>{' '}
            {weather.current.windSpeed} m/s
          </div>
          <div>
            <span className="text-gray-400">{t('pressure')}:</span>{' '}
            {weather.current.pressure} hPa
          </div>
          <div>
            <span className="text-gray-400">{t('visibility')}:</span>{' '}
            {(weather.current.visibility / 1000).toFixed(1)} km
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-3">
          {t('forecast')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {weather.forecast.map((day, index) => (
            <div key={index} className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-3 text-center">
                {new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>

              {/* Day Section */}
              <div className="mb-3 pb-3 border-b border-gray-600">
                <p className="text-xs text-gray-400 mb-1">{t('day')}</p>
                {day.day.temp !== null ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.day.icon}.png`}
                        alt={day.day.description}
                        className="w-8 h-8"
                      />
                      <p className="text-lg font-bold text-white">
                        {Math.round(day.day.temp)}°C
                      </p>
                    </div>
                    {day.day.tempMin !== null && day.day.tempMax !== null && (
                      <p className="text-xs text-gray-400">
                        {Math.round(day.day.tempMin)}° /{' '}
                        {Math.round(day.day.tempMax)}°
                      </p>
                    )}
                    <p className="text-xs text-gray-400 capitalize mt-1">
                      {day.day.description}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 italic">{t('noData')}</p>
                )}
              </div>

              {/* Night Section */}
              <div>
                <p className="text-xs text-gray-400 mb-1">{t('night')}</p>
                {day.night.temp !== null ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.night.icon}.png`}
                        alt={day.night.description}
                        className="w-8 h-8"
                      />
                      <p className="text-lg font-bold text-white">
                        {Math.round(day.night.temp)}°C
                      </p>
                    </div>
                    {day.night.tempMin !== null &&
                      day.night.tempMax !== null && (
                        <p className="text-xs text-gray-400">
                          {Math.round(day.night.tempMin)}° /{' '}
                          {Math.round(day.night.tempMax)}°
                        </p>
                      )}
                    <p className="text-xs text-gray-400 capitalize mt-1">
                      {day.night.description}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 italic">{t('noData')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

export default WeatherSection
