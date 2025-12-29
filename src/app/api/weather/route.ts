import { NextResponse } from 'next/server'

export const revalidate = 600 // Revalidate every 10 minutes

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const SHINJUKU_LAT = 35.6938
const SHINJUKU_LON = 139.7034

export async function GET() {
  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'OPENWEATHER_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    // Current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${SHINJUKU_LAT}&lon=${SHINJUKU_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`

    // 5-day forecast (returns 3-hour intervals, 40 data points)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${SHINJUKU_LAT}&lon=${SHINJUKU_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ])

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error('Weather API error')
    }

    const current = await currentRes.json()
    const forecast = await forecastRes.json()

    // Process forecast to get daily data (one reading per day for 5 days)
    // Filter to get one reading per day (every 8th item = ~24 hours)
    const dailyForecast = forecast.list
      .filter((item: any, index: number) => index % 8 === 0)
      .slice(0, 5)
      .map((item: any) => ({
        date: item.dt_txt,
        temp: item.main.temp,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      }))

    return NextResponse.json({
      current: {
        temp: current.main.temp,
        feelsLike: current.main.feels_like,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: current.wind.speed,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        visibility: current.visibility,
      },
      forecast: dailyForecast,
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

