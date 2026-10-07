import { useTravelStore } from '../store/travel.js'
import { focusStay, formatRange } from '../utils/travel.js'
import CityName from './CityName.jsx'

export default function HoverCard() {
  const hover = useTravelStore((state) => state.hover)
  const cursor = useTravelStore((state) => state.cursor)
  if (!hover) return null

  const place = focusStay(hover.location, cursor)
  if (!place) return null

  const flipX = hover.x > window.innerWidth - 230
  const flipY = hover.y > window.innerHeight - 120

  return (
    <div
      className="hover-card"
      style={{
        left: hover.x,
        top: hover.y,
        transform: `translate(${flipX ? 'calc(-100% - 14px)' : '14px'}, ${flipY ? 'calc(-100% - 14px)' : '14px'})`,
      }}
    >
      <strong><CityName name={place.location} country={place.country} /></strong>
      <span>{formatRange(place.stay.start, place.stay.end)}</span>
      {place.count > 1 ? <span>{place.count} stays</span> : null}
    </div>
  )
}
