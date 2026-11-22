// Intrinsic pixel sizes of the H.264 files. Each tile sets `aspect-ratio`
// from these numbers so the masonry cell has the right shape before the
// JPEG arrives. That is what keeps the page from shifting (CLS).
export type AnimalClipSource = {
  name: string
  width: number
  height: number
}

export const animalClips: readonly AnimalClipSource[] = [
  { name: 'adult-goats', width: 570, height: 320 },
  { name: 'akita', width: 266, height: 472 },
  { name: 'baby-goat', width: 216, height: 384 },
  { name: 'cat', width: 410, height: 230 },
  { name: 'chameleon', width: 554, height: 312 },
  { name: 'chickens', width: 206, height: 366 },
  { name: 'chicks', width: 250, height: 444 },
  { name: 'china-monkey', width: 252, height: 448 },
  { name: 'cows', width: 226, height: 402 },
  { name: 'deer', width: 332, height: 590 },
  { name: 'dog', width: 594, height: 334 },
  { name: 'dolphin', width: 242, height: 430 },
  { name: 'goats', width: 260, height: 146 },
  { name: 'horse', width: 416, height: 234 },
  { name: 'kid-goat', width: 252, height: 448 },
  { name: 'millipede', width: 342, height: 608 },
  { name: 'monkey', width: 316, height: 562 },
  { name: 'nara-deer', width: 146, height: 260 },
  { name: 'rabbits', width: 322, height: 572 },
  { name: 'sheep', width: 330, height: 586 },
  { name: 'small-monkey', width: 200, height: 356 },
  { name: 'squirrel', width: 374, height: 210 },
  { name: 'tortoise', width: 168, height: 298 },
  { name: 'whale', width: 218, height: 388 },
]

export function animalSrc(name: string): string {
  return `/animals/${name}.mp4`
}

export function animalPoster(name: string): string {
  return `/animals/${name}.jpg`
}
