import { create } from 'zustand'
import { stays, TIMELINE_END, TIMELINE_START } from '../utils/travel.js'

export const useTravelStore = create((set, get) => ({
  cursor: TIMELINE_END,
  playing: false,
  selected: null,
  hover: null,
  setCursor: (cursor) => {
    const { selected } = get()
    const stillThere = !selected || stays.some((stay) => stay.location === selected && stay.start <= cursor)
    set({
      cursor,
      selected: stillThere ? selected : null,
    })
  },
  setSelected: (selected) => set({ selected }),
  setHover: (hover) => set({ hover }),
  pause: () => set({ playing: false }),
  togglePlay: () => {
    const { playing, cursor } = get()
    if (playing) {
      set({ playing: false })
      return
    }
    const atEnd = cursor >= TIMELINE_END - 1000
    set({
      playing: true,
      cursor: atEnd ? TIMELINE_START : cursor,
      hover: null,
    })
  },
}))
