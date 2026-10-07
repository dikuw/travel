function count(value, singular, plural) {
  const label = value === 1 ? singular : plural
  return `${value.toLocaleString('en-US')} ${label}`
}

export default function TravelSummary({ summary, stays, className = 'summary' }) {
  const abroad = summary.abroad === 1
    ? '1 day abroad'
    : `${summary.abroad.toLocaleString('en-US')} days abroad`

  const counts = [
    stays != null ? count(stays, 'stay', 'stays') : null,
    count(summary.places, 'place', 'places'),
    count(summary.countries, 'country', 'countries'),
  ].filter(Boolean).join(' · ')

  return (
    <p className={className} title="Abroad means outside the United States">
      <span>{counts}</span>
      <span>{abroad} ({summary.abroadPercent}%)</span>
    </p>
  )
}
