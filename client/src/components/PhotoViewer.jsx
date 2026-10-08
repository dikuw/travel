import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cloudinary } from '../constants/photos.js'

export default function PhotoViewer({ photos, index, onIndex, onClose }) {
  const closeRef = useRef(null)
  const multiple = photos.length > 1
  const photo = photos[index]

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
      if (!multiple) return
      if (event.key === 'ArrowLeft' && index > 0) onIndex(index - 1)
      if (event.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [index, multiple, onClose, onIndex, photos.length])

  return createPortal(
    <div className="lightbox" role="presentation" onClick={onClose}>
      <div
        className="lightbox-frame"
        role="dialog"
        aria-modal="true"
        aria-label={`Photo ${index + 1} of ${photos.length}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close photos"
        >
          ×
        </button>
        {multiple && (
          <button
            type="button"
            className="lightbox-arrow lightbox-prev"
            onClick={() => onIndex(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
          >
            ‹
          </button>
        )}
        <img
          src={cloudinary(photo, 'c_limit,w_1800,q_auto,f_auto')}
          alt={`Photo ${index + 1} of ${photos.length}`}
        />
        {multiple && (
          <button
            type="button"
            className="lightbox-arrow lightbox-next"
            onClick={() => onIndex(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
          >
            ›
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
