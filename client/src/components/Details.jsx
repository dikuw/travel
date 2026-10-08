import { useEffect, useState } from 'react'
import { cloudinary, stayPhotos } from '../constants/photos.js'
import { useTravelStore } from '../store/travel.js'
import { formatDays, formatRange, placeDetails } from '../utils/travel.js'
import CityName from './CityName.jsx'
import PhotoViewer from './PhotoViewer.jsx'

export default function Details() {
  const selected = useTravelStore((state) => state.selected)
  const cursor = useTravelStore((state) => state.cursor)
  const setSelected = useTravelStore((state) => state.setSelected)
  const place = selected ? placeDetails(selected, cursor) : null
  const [viewer, setViewer] = useState(null)

  useEffect(() => {
    setViewer(null)
  }, [selected])

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
        {place.stays.map((stay) => {
          const photos = stayPhotos(stay.id)
          return (
            <li key={stay.id} className={stay.current ? 'is-current' : undefined}>
              <p className="stay-dates">{formatRange(stay.start, stay.end)}</p>
              <p className="stay-days">{formatDays(stay.days)}</p>
              {(stay.from || stay.to) && (
                <p className="stay-route">
                  {stay.from ? `From ${stay.from}` : 'First stop'}
                  {stay.to ? ` · To ${stay.to}` : ''}
                </p>
              )}
              {photos.length > 0 && (
                <button
                  type="button"
                  className="stay-photo"
                  onClick={() => setViewer({ photos, index: 0 })}
                  aria-label={`View ${photos.length === 1 ? 'photo' : `${photos.length} photos`}`}
                >
                  <img src={cloudinary(photos[0], 'c_fill,g_auto,w_480,h_320,q_auto,f_auto')} alt="" />
                </button>
              )}
            </li>
          )
        })}
      </ol>
      {viewer && (
        <PhotoViewer
          photos={viewer.photos}
          index={viewer.index}
          onIndex={(index) => setViewer({ ...viewer, index })}
          onClose={() => setViewer(null)}
        />
      )}
    </aside>
  )
}
