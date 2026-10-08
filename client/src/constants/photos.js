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
    'https://res.cloudinary.com/dikuw/image/upload/v1791500803/IMG_5036_zmfvjv.jpg',
  ],
  stay_006: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791500948/IMG_5110_bkubdi.jpg',
    'https://res.cloudinary.com/dikuw/image/upload/v1791500948/IMG_5111_tho1w6.jpg',
  ],
  stay_007: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791500948/IMG_5270_l5d2g5.jpg',
  ],
  stay_009: [
    'https://res.cloudinary.com/dikuw/image/upload/v1791501053/IMG_5367_ekfix6.jpg',
  ],
}

export function stayPhotos(id) {
  return STAY_PHOTOS[id] ?? []
}

export function cloudinary(url, transform) {
  return url.replace('/image/upload/', `/image/upload/${transform}/`)
}
