import { useEffect } from 'react'
import { useTravelStore } from '../store/travel.js'
import { LONG_STAY_DAYS, summarizeStays, TIMELINE_END, TIMELINE_START, TRAVEL_SUMMARY } from '../utils/travel.js'
import Details from './Details.jsx'
import Globe from './Globe.jsx'
import HoverCard from './HoverCard.jsx'
import Timeline from './Timeline.jsx'
import TimelineView from './TimelineView.jsx'
import TravelSummary from './TravelSummary.jsx'

function ViewToggle() {
  const view = useTravelStore((state) => state.view)
  const setView = useTravelStore((state) => state.setView)

  return (
    <div className="view-toggle" role="group" aria-label="View">
      <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>Map</button>
      <button type="button" aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}>Timeline</button>
    </div>
  )
}

export default function Main() {
  const cursor = useTravelStore((state) => state.cursor)
  const view = useTravelStore((state) => state.view)
  const summary = view === 'map' ? summarizeStays(cursor) : TRAVEL_SUMMARY
  const yearStart = new Date(TIMELINE_START).getUTCFullYear()
  const yearEnd = new Date(TIMELINE_END).getUTCFullYear()

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      const state = useTravelStore.getState()
      if (event.code === 'Space' && state.view === 'map') {
        event.preventDefault()
        state.togglePlay()
      }
      if (event.code === 'Escape' && state.view === 'map') state.setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className={view === 'timeline' ? 'app is-timeline' : 'app'}>
      <header className="topbar">
        <div className="brand">
          <p className="eyebrow">{yearStart} — {yearEnd}</p>
          <h1>Travel</h1>
          <TravelSummary summary={summary} />
          {view === 'map' && (
            <ul className="legend">
              <li><span className="swatch swatch-visit" /> Visit</li>
              <li title={`A single stay of ${LONG_STAY_DAYS} days or more`}>
                <span className="swatch swatch-long" /> Long stay
              </li>
            </ul>
          )}
        </div>
        <ViewToggle />
      </header>
      <div className={view === 'map' ? 'map-layer' : 'map-layer is-off'} inert={view === 'map' ? undefined : true}>
        <Globe />
        <Details />
        <HoverCard />
        <Timeline />
      </div>
      {view === 'timeline' && <TimelineView />}
    </main>
  )
}
