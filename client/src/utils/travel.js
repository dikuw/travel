import travelData from '../../../server/data/traveldata.json'
import { LOCATIONS } from '../constants/locations.js'

export const DAY_MS = 24 * 60 * 60 * 1000
export const LONG_STAY_DAYS = 21
export const PLAY_STEP_MS = 900

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function parseDay(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function inclusiveDays(start, end) {
  return Math.round((end - start) / DAY_MS) + 1
}

function localToday() {
  const now = new Date()
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
}

const scheduled = travelData.map((stay) => {
  const location = stay.city
  const coordinates = LOCATIONS[location]
  if (!coordinates) {
    throw new Error(`Missing coordinates for ${location}`)
  }
  const start = parseDay(stay.startDate)
  const end = parseDay(stay.endDate) + DAY_MS - 1
  const days = inclusiveDays(start, parseDay(stay.endDate))
  return {
    ...stay,
    location,
    coordinates,
    start,
    end,
    days,
    long: days >= LONG_STAY_DAYS,
  }
}).sort((a, b) => a.start - b.start)

export const stays = scheduled
  .filter((stay) => stay.start <= localToday())
  .map((stay, index) => ({ ...stay, index }))

export const TIMELINE_START = stays[0].start
export const TIMELINE_END = stays[stays.length - 1].end

export function formatDate(ms) {
  const date = new Date(ms)
  return `${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

export function formatRange(start, end) {
  const from = new Date(start)
  const to = new Date(end)
  const sameYear = from.getUTCFullYear() === to.getUTCFullYear()
  const startLabel = sameYear
    ? `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()}`
    : `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()}, ${from.getUTCFullYear()}`
  return `${startLabel} – ${MONTHS[to.getUTCMonth()]} ${to.getUTCDate()}, ${to.getUTCFullYear()}`
}

export function formatDays(days) {
  return days === 1 ? '1 day' : `${days} days`
}

export function formatItineraryRange(start, end) {
  const from = new Date(start)
  const to = new Date(end)
  const sameYear = from.getUTCFullYear() === to.getUTCFullYear()
  const sameMonth = sameYear && from.getUTCMonth() === to.getUTCMonth()
  const sameDay = sameMonth && from.getUTCDate() === to.getUTCDate()
  if (sameDay) return `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()}`
  if (sameMonth) return `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()} – ${to.getUTCDate()}`
  if (sameYear) {
    return `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()} – ${MONTHS[to.getUTCMonth()]} ${to.getUTCDate()}`
  }
  return `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()}, ${from.getUTCFullYear()} – ${MONTHS[to.getUTCMonth()]} ${to.getUTCDate()}, ${to.getUTCFullYear()}`
}

const HOME_COUNTRY = 'United States'

function utcMidnight(ms) {
  const date = new Date(ms)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function calendarDays(startMs, endMs) {
  const start = utcMidnight(startMs)
  const end = utcMidnight(endMs)
  if (end < start) return 0
  return Math.round((end - start) / DAY_MS) + 1
}

export function summarizeStays(cursor = Number.POSITIVE_INFINITY, year = null) {
  const places = new Set()
  const countries = new Set()
  let days = 0
  let abroad = 0
  const yearStart = year == null ? null : Date.UTC(year, 0, 1)
  const yearEnd = year == null ? null : Date.UTC(year, 11, 31)

  for (const stay of stays) {
    if (stay.start > cursor) continue
    let from = stay.start
    let to = Math.min(stay.end, cursor)
    if (yearStart != null) {
      from = Math.max(from, yearStart)
      to = Math.min(to, yearEnd)
    }
    const counted = calendarDays(from, to)
    if (!counted) continue
    places.add(stay.location)
    countries.add(stay.country)
    days += counted
    if (stay.country !== HOME_COUNTRY) abroad += counted
  }

  return {
    places: places.size,
    countries: countries.size,
    days,
    abroad,
    abroadPercent: days ? Math.round((abroad / days) * 100) : 0,
  }
}

export const TRAVEL_SUMMARY = summarizeStays()

function pushGroup(groups, stay) {
  const current = groups.at(-1)
  if (current?.country === stay.country) current.stays.push(stay)
  else groups.push({ id: stay.id, country: stay.country, stays: [stay] })
}

function continuation(stay, year) {
  const from = Date.UTC(year, 0, 1)
  const to = Math.min(stay.end, Date.UTC(year, 11, 31))
  return {
    ...stay,
    id: `${stay.id}-${year}`,
    displayStart: from,
    displayEnd: to,
    displayDays: calendarDays(from, to),
  }
}

function groupItinerary(list) {
  const byYear = new Map()
  const years = new Set()
  for (const stay of list) {
    const startYear = new Date(stay.start).getUTCFullYear()
    const endYear = new Date(stay.end).getUTCFullYear()
    for (let year = startYear; year <= endYear; year += 1) years.add(year)
    let groups = byYear.get(startYear)
    if (!groups) {
      groups = []
      byYear.set(startYear, groups)
    }
    pushGroup(groups, stay)
  }
  for (const year of years) {
    if (byYear.has(year)) continue
    const groups = []
    for (const stay of list) {
      const startYear = new Date(stay.start).getUTCFullYear()
      const endYear = new Date(stay.end).getUTCFullYear()
      if (startYear < year && endYear >= year) pushGroup(groups, continuation(stay, year))
    }
    byYear.set(year, groups)
  }
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => {
      const groups = byYear.get(year)
      return {
        year,
        stays: groups.reduce((sum, group) => sum + group.stays.length, 0),
        summary: summarizeStays(Number.POSITIVE_INFINITY, year),
        groups,
      }
    })
}

export const itinerary = groupItinerary(stays)
export const PLACE_COUNT = new Set(stays.map((stay) => stay.location)).size

export function getStayAt(cursor) {
  let latest = null
  for (const stay of stays) {
    if (stay.start > cursor) break
    latest = stay
    if (cursor <= stay.end) return { stay, during: true }
  }
  return { stay: latest, during: false }
}

export function nextStayStart(cursor) {
  const next = stays.find((stay) => stay.start > cursor + 1000)
  return next ? next.start : null
}

function staysUntil(location, cursor) {
  return stays.filter((stay) => stay.location === location && stay.start <= cursor)
}

export function focusStay(location, cursor) {
  const list = staysUntil(location, cursor)
  if (!list.length) return null
  const current = list.find((stay) => cursor <= stay.end)
  const stay = current ?? list[list.length - 1]
  const longest = Math.max(...list.map((item) => item.days))
  return {
    location,
    country: stay.country,
    stay,
    count: list.length,
    total: list.reduce((sum, item) => sum + item.days, 0),
    long: longest >= LONG_STAY_DAYS,
  }
}

export function placeDetails(location, cursor) {
  const list = staysUntil(location, cursor)
  if (!list.length) return null
  const longest = Math.max(...list.map((item) => item.days))
  return {
    location,
    country: list[0].country,
    count: list.length,
    total: list.reduce((sum, item) => sum + item.days, 0),
    long: longest >= LONG_STAY_DAYS,
    stays: list.map((stay) => {
      const next = stays[stay.index + 1]
      return {
        ...stay,
        from: stays[stay.index - 1]?.location ?? null,
        to: next && next.start <= cursor ? next.location : null,
        current: stay.start <= cursor && cursor <= stay.end,
      }
    }),
  }
}

export function visiblePlaceCount(cursor) {
  return new Set(stays.filter((stay) => stay.start <= cursor).map((stay) => stay.location)).size
}

function toVector(lng, lat) {
  const lambda = (lng * Math.PI) / 180
  const phi = (lat * Math.PI) / 180
  const cosPhi = Math.cos(phi)
  return [cosPhi * Math.cos(lambda), cosPhi * Math.sin(lambda), Math.sin(phi)]
}

function fromVector([x, y, z]) {
  return [
    (Math.atan2(y, x) * 180) / Math.PI,
    (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI,
  ]
}

function greatCircle(start, end, steps = 72) {
  const from = toVector(start[0], start[1])
  const to = toVector(end[0], end[1])
  const dot = from[0] * to[0] + from[1] * to[1] + from[2] * to[2]
  const omega = Math.acos(Math.min(1, Math.max(-1, dot)))
  if (omega < 1e-5) return [start, end]
  const points = []
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps
    const weightFrom = Math.sin((1 - t) * omega) / Math.sin(omega)
    const weightTo = Math.sin(t * omega) / Math.sin(omega)
    points.push(fromVector([
      from[0] * weightFrom + to[0] * weightTo,
      from[1] * weightFrom + to[1] * weightTo,
      from[2] * weightFrom + to[2] * weightTo,
    ]))
  }
  return points
}

function splitAntimeridian(points) {
  const lines = []
  let current = [points[0]]
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const next = points[index]
    if (Math.abs(next[0] - previous[0]) > 180) {
      lines.push(current)
      current = [next]
    } else {
      current.push(next)
    }
  }
  lines.push(current)
  return lines.filter((line) => line.length > 1)
}

function emptyCollection() {
  return { type: 'FeatureCollection', features: [] }
}

export function buildScene(cursor) {
  const visible = stays.filter((stay) => stay.start <= cursor)
  const { stay: activeStay, during } = getStayAt(cursor)
  const activeLocation = during ? activeStay?.location : null

  const places = new Map()
  for (const stay of visible) {
    const place = places.get(stay.location) ?? {
      location: stay.location,
      coordinates: stay.coordinates,
      days: 0,
      long: false,
    }
    place.days = Math.max(place.days, stay.days)
    place.long = place.long || stay.long
    places.set(stay.location, place)
  }

  const placeFeatures = [...places.values()].map((place) => ({
    type: 'Feature',
    id: place.location,
    properties: {
      location: place.location,
      days: place.days,
      long: place.long ? 1 : 0,
      active: place.location === activeLocation ? 1 : 0,
    },
    geometry: {
      type: 'Point',
      coordinates: place.coordinates,
    },
  }))

  const routeFeatures = []
  visible.forEach((stay, index) => {
    if (index === 0) return
    const previous = visible[index - 1]
    if (previous.location === stay.location) return
    const active = index === visible.length - 1 ? 1 : 0
    const segments = splitAntimeridian(greatCircle(previous.coordinates, stay.coordinates))
    segments.forEach((coordinates) => {
      routeFeatures.push({
        type: 'Feature',
        properties: { active },
        geometry: { type: 'LineString', coordinates },
      })
    })
  })

  const activeFeatures = activeLocation
    ? placeFeatures.filter((feature) => feature.properties.active === 1)
    : []

  return {
    routes: { ...emptyCollection(), features: routeFeatures },
    places: { ...emptyCollection(), features: placeFeatures },
    active: { ...emptyCollection(), features: activeFeatures },
    activeStay: during ? activeStay : null,
  }
}

export function angularDistance(from, to) {
  const start = toVector(from[0], from[1])
  const end = toVector(to[0], to[1])
  const dot = start[0] * end[0] + start[1] * end[1] + start[2] * end[2]
  return (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI
}
