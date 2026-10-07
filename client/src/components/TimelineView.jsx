import { useState } from 'react'
import { useTravelStore } from '../store/travel.js'
import { formatDays, formatItineraryRange, itinerary } from '../utils/travel.js'
import CityName from './CityName.jsx'
import TravelSummary from './TravelSummary.jsx'

function Chevron() {
  return (
    <svg className="year-chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TimelineView() {
  const openOnMap = useTravelStore((state) => state.openOnMap)
  const [collapsed, setCollapsed] = useState(() => new Set())

  const toggleYear = (year) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return next
    })
  }

  return (
    <div className="itinerary">
      {itinerary.map((year) => {
        const isCollapsed = collapsed.has(year.year)
        return (
          <section className={isCollapsed ? 'year is-collapsed' : 'year'} key={year.year}>
            <h2 className="year-heading">
              <button
                type="button"
                className="year-toggle"
                aria-expanded={!isCollapsed}
                aria-controls={`year-${year.year}-trips`}
                onClick={() => toggleYear(year.year)}
              >
                <Chevron />
                <span className="year-label">{year.year}</span>
              </button>
              <span className="year-rule" aria-hidden="true" />
            </h2>
            <div className="year-body">
            <TravelSummary className="summary year-summary" summary={year.summary} stays={year.stays} />
            <div id={`year-${year.year}-trips`} hidden={isCollapsed}>
              {year.groups.map((group) => (
                <div className="trip" key={group.id}>
                  <h3 className="trip-country"><CityName name={group.country} country={group.country} /></h3>
                  <ol className="trip-stops">
                    {group.stays.map((stay) => {
                      const start = stay.displayStart ?? stay.start
                      const end = stay.displayEnd ?? stay.end
                      const days = stay.displayDays ?? stay.days
                      return (
                        <li key={stay.id}>
                          <button
                            type="button"
                            className="stop"
                            onClick={() => openOnMap(stay.location, stay.start)}
                            title="Show on the map"
                          >
                            <span className="stop-name">{stay.location}</span>
                            <span className="stop-dates">{formatItineraryRange(start, end)}</span>
                            <span className="stop-days">{formatDays(days)}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              ))}
            </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
