import { flagSrc } from '../constants/flags.js'

export default function CityName({ name, country }) {
  const src = flagSrc(country)
  return (
    <>
      {name}
      {src ? <img className="flag" src={src} alt="" /> : null}
    </>
  )
}
