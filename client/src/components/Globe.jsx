import { useEffect, useRef } from 'react'
import { AttributionControl, Map, NavigationControl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTravelStore } from '../store/travel.js'
import { angularDistance, buildScene } from '../utils/travel.js'

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

const RADIUS = [
  'interpolate', ['linear'], ['get', 'days'],
  7, 6,
  21, 8,
  90, 12,
  700, 18,
]

function paintScene(map, cursor) {
  const scene = buildScene(cursor)
  map.getSource('routes').setData(scene.routes)
  map.getSource('places').setData(scene.places)
  map.getSource('active').setData(scene.active)
}

function addLayers(map) {
  const empty = { type: 'FeatureCollection', features: [] }
  map.addSource('routes', { type: 'geojson', data: empty })
  map.addSource('places', { type: 'geojson', data: empty })
  map.addSource('active', { type: 'geojson', data: empty })

  map.addLayer({
    id: 'route-glow',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['case', ['==', ['get', 'active'], 1], '#c9842a', '#24556d'],
      'line-width': ['case', ['==', ['get', 'active'], 1], 7, 4],
      'line-opacity': ['case', ['==', ['get', 'active'], 1], 0.28, 0.16],
      'line-blur': 1.2,
    },
  })

  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['case', ['==', ['get', 'active'], 1], '#c45a12', '#16384c'],
      'line-width': ['case', ['==', ['get', 'active'], 1], 3, 2.2],
      'line-opacity': 0.92,
    },
  })

  map.addLayer({
    id: 'place-active',
    type: 'circle',
    source: 'active',
    paint: {
      'circle-radius': 16,
      'circle-color': '#c56a1a',
      'circle-opacity': 0.18,
      'circle-blur': 0.35,
    },
  })

  map.addLayer({
    id: 'place-halos',
    type: 'circle',
    source: 'places',
    filter: ['==', ['get', 'long'], 1],
    paint: {
      'circle-radius': ['+', RADIUS, 6],
      'circle-color': 'rgba(0,0,0,0)',
      'circle-pitch-alignment': 'map',
      'circle-stroke-color': '#c45a12',
      'circle-stroke-width': 2,
      'circle-opacity': 1,
    },
  })

  map.addLayer({
    id: 'places',
    type: 'circle',
    source: 'places',
    paint: {
      'circle-radius': RADIUS,
      'circle-pitch-alignment': 'map',
      'circle-color': ['case', ['==', ['get', 'long'], 1], '#e2a04a', '#1f6f86'],
      'circle-stroke-color': '#fffaf3',
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 3,
        ['==', ['get', 'active'], 1], 2.6,
        1.25,
      ],
      'circle-opacity': 1,
    },
  })
}

export default function Globe() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const readyRef = useRef(false)
  const hoveredId = useRef(null)
  const facedLocation = useRef(null)
  const cursor = useTravelStore((state) => state.cursor)
  const playing = useTravelStore((state) => state.playing)
  const setSelected = useTravelStore((state) => state.setSelected)
  const setHover = useTravelStore((state) => state.setHover)

  useEffect(() => {
    const map = new Map({
      container: containerRef.current,
      style: STYLE,
      center: [18, 32],
      zoom: 1.55,
      minZoom: 0.7,
      attributionControl: false,
      renderWorldCopies: false,
      fadeDuration: 0,
    })

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left')

    const clearHover = () => {
      map.getCanvas().style.cursor = ''
      if (hoveredId.current != null) {
        map.setFeatureState({ source: 'places', id: hoveredId.current }, { hover: false })
        hoveredId.current = null
      }
      setHover(null)
    }

    const featureAt = (point) => {
      if (!map.getLayer('places')) return null
      const features = map.queryRenderedFeatures(point, { layers: ['places', 'place-halos'] })
      return features.find((feature) => feature.layer.id === 'places') ?? features[0] ?? null
    }

    const hoverFeature = (event) => {
      const feature = featureAt(event.point)
      if (!feature) {
        if (hoveredId.current != null) clearHover()
        return
      }
      map.getCanvas().style.cursor = 'pointer'
      if (hoveredId.current != null && hoveredId.current !== feature.id) {
        map.setFeatureState({ source: 'places', id: hoveredId.current }, { hover: false })
      }
      hoveredId.current = feature.id
      map.setFeatureState({ source: 'places', id: feature.id }, { hover: true })
      setHover({
        location: feature.properties.location,
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY,
      })
    }

    const selectFeature = (event) => {
      const feature = featureAt(event.point)
      if (!feature) {
        setSelected(null)
        return
      }
      setSelected(feature.properties.location)
      map.flyTo({
        center: feature.geometry.coordinates,
        zoom: Math.max(map.getZoom(), 3.2),
        speed: 0.8,
        essential: true,
      })
    }

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' })
      map.setSky({
        'sky-color': '#071018',
        'horizon-color': '#8eb4c9',
        'fog-color': '#d7e4ee',
        'sky-horizon-blend': 0.65,
        'horizon-fog-blend': 0.35,
        'fog-ground-blend': 0.15,
        'atmosphere-blend': 0.9,
      })
      addLayers(map)
      readyRef.current = true
      paintScene(map, useTravelStore.getState().cursor)
    })

    map.on('mousemove', hoverFeature)
    map.on('mouseout', clearHover)
    map.on('click', selectFeature)

    mapRef.current = map
    return () => {
      readyRef.current = false
      map.remove()
      mapRef.current = null
    }
  }, [setHover, setSelected])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current || !map.getSource('places')) return
    paintScene(map, cursor)
  }, [cursor])

  useEffect(() => {
    const map = mapRef.current
    if (!playing) {
      facedLocation.current = null
      return
    }
    if (!map || !readyRef.current) return
    const scene = buildScene(cursor)
    const stay = scene.activeStay
    if (!stay || facedLocation.current === stay.location) return
    facedLocation.current = stay.location
    const center = map.getCenter()
    const distance = angularDistance([center.lng, center.lat], stay.coordinates)
    if (distance < 70) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    map.easeTo({
      center: stay.coordinates,
      duration: reduceMotion ? 0 : 800,
      essential: true,
    })
  }, [cursor, playing])

  return <div ref={containerRef} className="globe" />
}
