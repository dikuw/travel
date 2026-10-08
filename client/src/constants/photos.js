const STAY_PHOTOS = {
  stay_001: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791499525/IMG_4093_avxuez.jpg',
    'https://res.cloudinary.com/dikuw/image/upload/v1791499518/IMG_4098_lgpotr.jpg',
  ],
  stay_002: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791499505/IMG_4139_adfvvn.jpg',
  ],
  stay_003: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791499489/IMG_4150_jjtr0k.jpg',
  ],
  stay_004: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791500466/IMG_4315_o2ymnz.jpg',
    'https://res.cloudinary.com/dikuw/image/upload/v1791500474/IMG_4321_dj7eg1.jpg',
  ],
  stay_005: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791500484/IMG_4765_tfruvn.jpg',
    'https://res.cloudinary.com/dikuw/image/upload/v1791500489/IMG_4841_oxb2ho.jpg',
  ],
}

export function stayPhotos(id) {
  return STAY_PHOTOS[id] ?? []
}

export function cloudinary(url, transform) {
  return url.replace('/image/upload/', `/image/upload/${transform}/`)
}
