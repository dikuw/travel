import { useTravelStore } from '../store/travel.js'
import { formatDays, formatRange, placeDetails } from '../utils/travel.js'
import CityName from './CityName.jsx'

export default function Details() {
  const selected = useTravelStore((state) => state.selected)
  const cursor = useTravelStore((state) => state.cursor)
  const setSelected = useTravelStore((state) => state.setSelected)
  const place = selected ? placeDetails(selected, cursor) : null

  if (!place) return null

  return (
    <aside className="details" aria-label={`${place.location}, ${place.country}`}>
      <div className="details-head">
        <div>
          <h2><CityName name={place.location} country={place.country} /></h2>
        </div>
        <button type="button" className="close" onClick={() => setSelected(null)} aria-label="Close details">
          Close
        </button>
      </div>
      <p className="details-summary">
        {place.count === 1 ? '1 stay' : `${place.count} stays`}
        <span aria-hidden="true"> · </span>
        {formatDays(place.total)}
      </p>
      <ol className="stay-list">
        {place.stays.map((stay) => (
          <li key={stay.id} className={stay.current ? 'is-current' : undefined}>
            <p className="stay-dates">{formatRange(stay.start, stay.end)}</p>
            <p className="stay-days">{formatDays(stay.days)}</p>
            {(stay.from || stay.to) && (
              <p className="stay-route">
                {stay.from ? `From ${stay.from}` : 'First stop'}
                {stay.to ? ` · To ${stay.to}` : ''}
              </p>
            )}
          </li>
        ))}
      </ol>
    </aside>
  )
}
