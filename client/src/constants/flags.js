const COUNTRY_CODES = {
  Argentina: 'AR',
  Austria: 'AT',
  Brazil: 'BR',
  Cambodia: 'KH',
  Canada: 'CA',
  Chile: 'CL',
  China: 'CN',
  Colombia: 'CO',
  Czechia: 'CZ',
  Ecuador: 'EC',
  France: 'FR',
  Germany: 'DE',
  Greece: 'GR',
  'Hong Kong': 'HK',
  Hungary: 'HU',
  Indonesia: 'ID',
  Italy: 'IT',
  Japan: 'JP',
  Malaysia: 'MY',
  Mexico: 'MX',
  Monaco: 'MC',
  Morocco: 'MA',
  Netherlands: 'NL',
  Norway: 'NO',
  Panama: 'PA',
  Paraguay: 'PY',
  Peru: 'PE',
  Philippines: 'PH',
  Portugal: 'PT',
  Romania: 'RO',
  Singapore: 'SG',
  'South Korea': 'KR',
  Spain: 'ES',
  Sweden: 'SE',
  Thailand: 'TH',
  Türkiye: 'TR',
  'United Kingdom': 'GB',
  'United States': 'US',
  Uruguay: 'UY',
  Vietnam: 'VN',
}

const flagUrls = import.meta.glob('../assets/flags/*.svg', { eager: true, import: 'default' })

export function flagSrc(country) {
  const code = COUNTRY_CODES[country]?.toLowerCase()
  if (!code) return ''
  return flagUrls[`../assets/flags/${code}.svg`] ?? ''
}
