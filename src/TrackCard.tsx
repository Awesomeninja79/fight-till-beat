import type { CSSProperties, ReactNode } from 'react'

type Props = {
  title: string; subtitle: string; detail: string; durationSec: number; index: number; color: string
  selected: boolean; previewing?: boolean; provider?: boolean; onSelect: () => void; action: ReactNode
}

export default function TrackCard({ title, subtitle, detail, durationSec, index, color, selected, previewing = false, provider = false, onSelect, action }: Props) {
  return <article className={`track-card ${selected ? 'selected' : ''} ${provider ? 'jamendo-track' : ''}`} style={{ '--track-color': color } as CSSProperties}>
    <button className="track-select" onClick={onSelect} aria-label={`Select ${title}`} aria-pressed={selected}>
      <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="track-info"><strong>{title}</strong><small>{subtitle}</small><small>{detail}</small></span>
      <div className={`waveform ${previewing ? 'waveform-active' : ''}`} aria-hidden="true">
        {Array.from({ length: 34 }, (_, i) => <span key={i} style={{ height: `${12 + Math.abs(Math.sin(i * 1.89 + index + 2) * Math.cos(i * 0.42 + index + 2)) * 34}px` }} />)}
      </div>
      <span className="track-duration">{Math.floor(durationSec / 60)}:{String(Math.floor(durationSec % 60)).padStart(2, '0')}</span>
    </button>
    {action}
  </article>
}
