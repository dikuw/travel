import { useEffect } from 'react'
import { useTravelStore } from '../store/travel.js'
import { LONG_STAY_DAYS, visiblePlaceCount } from '../utils/travel.js'
import Details from './Details.jsx'
import Globe from './Globe.jsx'
import HoverCard from './HoverCard.jsx'
import Timeline from './Timeline.jsx'

export default function Main() {
  const cursor = useTravelStore((state) => state.cursor)
  const places = visiblePlaceCount(cursor)

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.code === 'Space') {
        event.preventDefault()
        useTravelStore.getState().togglePlay()
      }
      if (event.code === 'Escape') useTravelStore.getState().setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="app">
      <Globe />
      <header className="topbar">
        <p className="eyebrow">2015 — 2024</p>
        <h1>Travel</h1>
        <p className="summary">{places} {places === 1 ? 'place' : 'places'}</p>
        <ul className="legend">
          <li><span className="swatch swatch-visit" /> Visit</li>
          <li title={`A single stay of ${LONG_STAY_DAYS} days or more`}>
            <span className="swatch swatch-long" /> Long stay
          </li>
        </ul>
      </header>
      <Details />
      <HoverCard />
      <Timeline />
    </main>
  )
}
