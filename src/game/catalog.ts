import type { CatalogTrack, MusicLanguage } from '../types'

export const LANGUAGE_LABELS: Record<MusicLanguage, string> = {
  en: 'English', hi: 'Hindi', instrumental: 'Instrumental', other: 'Other',
}

export function filterCatalog(tracks: CatalogTrack[], query: string, language: MusicLanguage | 'all') {
  const words = query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return tracks.filter(track => {
    if (language !== 'all' && track.language !== language) return false
    const text = `${track.title} ${track.artist} ${track.mood} ${track.language ? LANGUAGE_LABELS[track.language] : ''}`.normalize('NFKC').toLocaleLowerCase()
    return words.every(word => text.includes(word))
  })
}
