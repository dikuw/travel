import { useEffect } from 'react'
import { useTravelStore } from '../store/travel.js'
import {
  formatDate,
  formatRange,
  getStayAt,
  nextStayStart,
  PLAY_STEP_MS,
  TIMELINE_END,
  TIMELINE_START,
} from '../utils/travel.js'
import CityName from './CityName.jsx'

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.8v10.4L13 8 4 2.8Z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5h2.6v11H4v-11Zm5.4 0H12v11H9.4v-11Z" fill="currentColor" />
    </svg>
  )
}

export default function Timeline() {
  const cursor = useTravelStore((state) => state.cursor)
  const playing = useTravelStore((state) => state.playing)
  const setCursor = useTravelStore((state) => state.setCursor)
  const togglePlay = useTravelStore((state) => state.togglePlay)
  const pause = useTravelStore((state) => state.pause)
  const { stay, during } = getStayAt(cursor)

  useEffect(() => {
    if (!playing) return undefined
    let timeout
    const advance = () => {
      const state = useTravelStore.getState()
      const next = nextStayStart(state.cursor)
      if (next == null) {
        state.setCursor(TIMELINE_END)
        state.pause()
        return
      }
      state.setCursor(next)
      timeout = window.setTimeout(advance, PLAY_STEP_MS)
    }
    timeout = window.setTimeout(advance, PLAY_STEP_MS)
    return () => window.clearTimeout(timeout)
  }, [playing])

  const placeLabel = !stay ? 'The start' : during ? stay.location : 'Between stays'
  const rangeLabel = during ? formatRange(stay.start, stay.end) : null

  return (
    <footer className="timeline">
      <button
        type="button"
        className="play"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play travels'}
        aria-pressed={playing}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="timeline-readout">
        <time dateTime={new Date(cursor).toISOString()}>{formatDate(cursor)}</time>
        <strong className={during && stay.long ? 'is-long' : undefined}>
          {during ? <CityName name={stay.location} country={stay.country} /> : placeLabel}
        </strong>
        {rangeLabel ? <span>{rangeLabel}</span> : <span>Drag to a date, or play from here</span>}
      </div>
      <label className="slider">
        <span className="sr-only">Travel date</span>
        <input
          type="range"
          min={TIMELINE_START}
          max={TIMELINE_END}
          step={24 * 60 * 60 * 1000}
          value={cursor}
          aria-valuetext={formatDate(cursor)}
          onPointerDown={pause}
          onChange={(event) => setCursor(Number(event.target.value))}
        />
        <span className="slider-ends" aria-hidden="true">
          <span>{new Date(TIMELINE_START).getUTCFullYear()}</span>
          <span>{new Date(TIMELINE_END).getUTCFullYear()}</span>
        </span>
      </label>
    </footer>
  )
}
