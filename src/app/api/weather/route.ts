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

    // Process forecast to get daily data with day/night segmentation
    // Group 3-hour intervals by date and separate into day (6am-6pm) and night (6pm-6am)
    const dailyDataMap = new Map<
      string,
      {
        date: string
        day: {
          temps: number[]
          descriptions: string[]
          icons: string[]
        }
        night: {
          temps: number[]
          descriptions: string[]
          icons: string[]
        }
      }
    >()

    forecast.list.forEach((item: any) => {
      const dateTime = new Date(item.dt_txt)
      const date = item.dt_txt.split(' ')[0] // Get just the date part (YYYY-MM-DD)
      const hour = dateTime.getHours()

      // Determine if this reading is day (6am-6pm) or night (6pm-6am)
      const isDay = hour >= 6 && hour < 18

      // For night period: 6pm-midnight belongs to current date, midnight-6am belongs to previous date
      let targetDate = date
      if (!isDay && hour < 6) {
        // This is early morning (midnight-6am), so it belongs to the previous day's night period
        const prevDate = new Date(dateTime)
        prevDate.setDate(prevDate.getDate() - 1)
        targetDate = prevDate.toISOString().split('T')[0]
      }

      if (!dailyDataMap.has(targetDate)) {
        dailyDataMap.set(targetDate, {
          date: targetDate,
          day: {
            temps: [],
            descriptions: [],
            icons: [],
          },
          night: {
            temps: [],
            descriptions: [],
            icons: [],
          },
        })
      }

      const dayData = dailyDataMap.get(targetDate)!
      const period = isDay ? dayData.day : dayData.night

      // Store actual temperature values to calculate true min/max for the period
      period.temps.push(item.main.temp)
      period.descriptions.push(item.weather[0].description)
      period.icons.push(item.weather[0].icon)
    })

    // Convert to array and filter to only include today and future days
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of today for comparison

    const dailyForecast = Array.from(dailyDataMap.values())
      .filter((dayData) => {
        // Only include dates that are today or in the future
        const forecastDate = new Date(dayData.date)
        forecastDate.setHours(0, 0, 0, 0)
        return forecastDate >= today
      })
      .slice(0, 5) // Get first 5 days (today + next 4 days)
      .map((dayData) => {
        // Calculate day peak (max) and trough (min) from all day temperatures
        const dayTempMin =
          dayData.day.temps.length > 0 ? Math.min(...dayData.day.temps) : null
        const dayTempMax =
          dayData.day.temps.length > 0 ? Math.max(...dayData.day.temps) : null
        const dayTemp =
          dayData.day.temps.length > 0
            ? dayData.day.temps[Math.floor(dayData.day.temps.length / 2)] // Representative temp
            : null
        const dayDescription = dayData.day.descriptions[0] || ''
        const dayIcon = dayData.day.icons[0] || ''

        // Calculate night peak (max) and trough (min) from all night temperatures
        const nightTempMin =
          dayData.night.temps.length > 0
            ? Math.min(...dayData.night.temps)
            : null
        const nightTempMax =
          dayData.night.temps.length > 0
            ? Math.max(...dayData.night.temps)
            : null
        const nightTemp =
          dayData.night.temps.length > 0
            ? dayData.night.temps[Math.floor(dayData.night.temps.length / 2)] // Representative temp
            : null
        const nightDescription = dayData.night.descriptions[0] || ''
        const nightIcon = dayData.night.icons[0] || ''

        // Overall daily min/max (for display) - across both day and night
        const allTemps = [...dayData.day.temps, ...dayData.night.temps]
        const overallTempMin =
          allTemps.length > 0 ? Math.min(...allTemps) : null
        const overallTempMax =
          allTemps.length > 0 ? Math.max(...allTemps) : null

        return {
          date: `${dayData.date} 12:00:00`, // Set to noon for display
          day: {
            temp: dayTemp,
            tempMin: dayTempMin,
            tempMax: dayTempMax,
            description: dayDescription,
            icon: dayIcon,
          },
          night: {
            temp: nightTemp,
            tempMin: nightTempMin,
            tempMax: nightTempMax,
            description: nightDescription,
            icon: nightIcon,
          },
          tempMin: overallTempMin,
          tempMax: overallTempMax,
        }
      })

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
