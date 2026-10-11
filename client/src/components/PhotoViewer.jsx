import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cloudinary } from '../constants/photos.js'

export default function PhotoViewer({ photos, index, onIndex, onClose }) {
  const stripRef = useRef(null)
  const currentThumbRef = useRef(null)
  const imageRef = useRef(null)
  const multiple = photos.length > 1
  const photo = photos[index]
  const src = cloudinary(photo, 'c_limit,w_1800,q_auto,f_auto')
  const [readySrc, setReadySrc] = useState(null)
  const loading = readySrc !== src

  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) setReadySrc(src)
  }, [src])

  useEffect(() => {
    const strip = stripRef.current
    const thumb = currentThumbRef.current
    if (!strip || !thumb) return
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2
    strip.scrollTo({ left, behavior: 'smooth' })
  }, [index])

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
        <div className="lightbox-stage">
          <div className="lightbox-photo-wrap">
          {multiple && (
            <div className="lightbox-thumbs" ref={stripRef} aria-label="Photo thumbnails">
              {photos.map((url, thumbIndex) => (
                <button
                  key={`${url}-${thumbIndex}`}
                  ref={thumbIndex === index ? currentThumbRef : undefined}
                  type="button"
                  className={thumbIndex === index ? 'is-current' : undefined}
                  aria-label={`Photo ${thumbIndex + 1}`}
                  aria-current={thumbIndex === index ? 'true' : undefined}
                  onClick={() => onIndex(thumbIndex)}
                >
                  <img src={cloudinary(url, 'c_fill,g_auto,w_160,h_108,q_auto,f_auto')} alt="" />
                </button>
              ))}
            </div>
          )}
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
          <div className="lightbox-photo-frame" aria-busy={loading}>
            {loading && (
              <div className="lightbox-loading" role="status" aria-label="Loading photo">
                <span />
              </div>
            )}
            <img
              ref={imageRef}
              className={loading ? 'lightbox-photo is-loading' : 'lightbox-photo'}
              src={src}
              alt={`Photo ${index + 1} of ${photos.length}`}
              onLoad={() => setReadySrc(src)}
              onError={() => setReadySrc(src)}
            />
          </div>
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
        </div>
      </div>
    </div>,
    document.body,
  )
}
