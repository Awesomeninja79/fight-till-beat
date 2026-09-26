import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioEngine } from './audio/AudioEngine'
import { comboAt, validateCueMap } from './game/timeline'
import ClubScene from './scene/ClubScene'
import type { CueMap, Phase, Quality, Track } from './types'

type InfoPanel = 'help' | 'credits' | 'privacy' | null

const SETTINGS_KEY = 'ftb-settings-v1'

function readSettings() {
  const reduceBySystem = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      volume: typeof saved.volume === 'number' ? saved.volume : 0.8,
      effectsVolume: typeof saved.effectsVolume === 'number' ? saved.effectsVolume : 0.55,
      muted: Boolean(saved.muted),
      reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : reduceBySystem,
      reducedFlash: typeof saved.reducedFlash === 'boolean' ? saved.reducedFlash : true,
      quality: saved.quality === 'low' || saved.quality === 'high' ? saved.quality as Quality : (window.innerWidth < 850 ? 'low' : 'high') as Quality,
    }
  } catch {
    return { volume: 0.8, effectsVolume: 0.55, muted: false, reducedMotion: reduceBySystem, reducedFlash: true, quality: (window.innerWidth < 850 ? 'low' : 'high') as Quality }
  }
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function Waveform({ seed, active = false }: { seed: number; active?: boolean }) {
  return <div className={`waveform ${active ? 'waveform-active' : ''}`} aria-hidden="true">
    {Array.from({ length: 34 }, (_, i) => {
      const height = 12 + Math.abs(Math.sin(i * 1.89 + seed) * Math.cos(i * 0.42 + seed)) * 34
      return <span key={i} style={{ height: `${height}px` }} />
    })}
  </div>
}

export default function App() {
  const engine = useMemo(() => new AudioEngine(), [])
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('menu')
  const [cues, setCues] = useState<CueMap | null>(null)
  const [songTime, setSongTime] = useState(0)
  const [error, setError] = useState('')
  const [panel, setPanel] = useState<InfoPanel>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(readSettings)
  const [webglOk, setWebglOk] = useState(true)
  const phaseRef = useRef(phase)
  const selected = tracks.find(t => t.id === selectedId) ?? tracks[0] ?? null

  useEffect(() => { phaseRef.current = phase }, [phase])

  useEffect(() => {
    const controller = new AbortController()
    try {
      const canvas = document.createElement('canvas')
      setWebglOk(Boolean(canvas.getContext('webgl2')))
    } catch { setWebglOk(false) }
    fetch('/content/tracks.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Track catalog could not be loaded.')
        return response.json() as Promise<Track[]>
      })
      .then(data => {
        setTracks(data)
        setSelectedId(data[0]?.id ?? '')
      })
      .catch(reason => {
        if (controller.signal.aborted) return
        setError(reason instanceof Error ? reason.message : 'Track catalog unavailable.')
        setPhase('error')
      })
    return () => { controller.abort(); engine.dispose() }
  }, [engine])

  useEffect(() => {
    engine.setVolume(settings.volume)
    engine.setEffectsVolume(settings.effectsVolume)
    engine.setMuted(settings.muted)
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch { /* preferences remain in memory */ }
  }, [engine, settings])

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (phaseRef.current === 'playing' || previewId) setSongTime(engine.getTime())
    }, 100)
    return () => window.clearInterval(tick)
  }, [engine, previewId])

  const pause = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    engine.pause()
    setPhase('paused')
  }, [engine])

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [pause])

  const stopPreview = useCallback(() => {
    engine.stop()
    setPreviewId(null)
    setSongTime(0)
  }, [engine])

  const preview = async (track: Track) => {
    if (previewId === track.id) { stopPreview(); return }
    setError('')
    try {
      await engine.play(track.audio, 0, () => setPreviewId(null))
      setPreviewId(track.id)
      setSongTime(0)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to play preview.')
      setPreviewId(null)
    }
  }

  const startFight = async () => {
    if (!selected || !webglOk) return
    engine.stop()
    setPreviewId(null)
    setSongTime(0)
    setError('')
    setPhase('loading')
    try {
      await engine.unlock()
      const response = await fetch(selected.cues)
      if (!response.ok) throw new Error('Fight cues could not be loaded.')
      const map = validateCueMap(await response.json(), selected.id)
      await engine.play(selected.audio, 0, () => { setSongTime(selected.durationSec); setPhase('finished') })
      engine.scheduleFightEffects(map)
      setCues(map)
      setPhase('playing')
    } catch (reason) {
      engine.stop()
      setError(reason instanceof Error ? reason.message : 'Unable to start the fight.')
      setPhase('error')
    }
  }

  const resume = useCallback(async () => {
    try {
      await engine.resume(() => { setSongTime(selected?.durationSec ?? 0); setPhase('finished') })
      if (cues) engine.scheduleFightEffects(cues)
      setPhase('playing')
    } catch {
      setError('Audio could not resume. Choose a track and try again.')
      setPhase('error')
    }
  }, [engine, cues, selected?.durationSec])

  const backToMenu = () => {
    engine.stop()
    setPreviewId(null)
    setSongTime(0)
    setCues(null)
    setPhase('menu')
    setShowSettings(false)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('button, input, select, a')) return
      if (event.code === 'Space') {
        event.preventDefault()
        if (phaseRef.current === 'playing') pause()
        else if (phaseRef.current === 'paused') void resume()
      }
      if (event.key === 'Escape') {
        setPanel(null)
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pause, resume])

  const resetPreferences = () => {
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(readSettings())
  }

  const inFight = phase === 'playing' || phase === 'paused' || phase === 'finished'
  const progress = selected ? Math.min(100, (songTime / selected.durationSec) * 100) : 0
  const combo = cues ? comboAt(cues.events, songTime * 1000) : 0

  return (
    <div className="app" style={{ '--accent': selected?.colors[0] ?? '#ff4ac6', '--accent-secondary': selected?.colors[1] ?? '#7c5cff' } as React.CSSProperties}>
      {webglOk && <ClubScene engine={engine} phase={phase} track={selected} cues={cues} reducedMotion={settings.reducedMotion} reducedFlash={settings.reducedFlash} quality={settings.quality} />}
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <header className="topbar">
        <button className="brand" onClick={backToMenu} aria-label="Fight Till Beat home">
          <span className="brand-mark">F<span>✦</span>B</span>
          <span className="brand-name">FIGHT <strong>TILL</strong> BEAT</span>
        </button>
        <div className="topbar-right">
          <span className="edition">THE RHYTHM IS THE WEAPON <b>•</b> VOL. 01</span>
          <button className="ghost-link" onClick={() => setPanel('help')}>HOW TO PLAY <span>↗</span></button>
          <button className="icon-button settings-button" onClick={() => setShowSettings(v => !v)} aria-label="Open settings" aria-expanded={showSettings}>⚙</button>
        </div>
      </header>

      {!inFight && phase !== 'loading' && (
        <main className="menu">
          <section className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> THE ARENA IS LIVE <span className="eyebrow-line" /></div>
            <h1>EVERY BEAT<br /><em>HITS HARDER.</em></h1>
            <p>Pick your track. The music takes control. Watch our hero turn every drop into a knockout on the neon dance floor.</p>
            <div className="hero-tags"><span>3 ORIGINAL TRACKS</span><span>AUTO-CHOREOGRAPHED COMBAT</span><span>3D DISCO ARENA</span></div>
          </section>

          <section className="track-panel" aria-label="Choose your music">
            <div className="panel-topline"><span>01 / CHOOSE YOUR SOUND</span><span className="panel-line" /><span>{String(tracks.length).padStart(2, '0')} TRACKS</span></div>
            <h2>THE TRACKLIST<span className="heading-star">✳</span></h2>
            <p className="panel-subtitle">Your soundtrack writes the fight.</p>
            {tracks.length === 0 && phase !== 'error' && <p className="load-note">Loading original tracks…</p>}
            <div className="track-list">
              {tracks.map((track, index) => {
                const isSelected = selected?.id === track.id
                const isPreviewing = previewId === track.id
                return (
                  <article key={track.id} className={`track-card ${isSelected ? 'selected' : ''}`} style={{ '--track-color': track.colors[0] } as React.CSSProperties}>
                    <button className="track-select" onClick={() => { if (previewId) stopPreview(); setSelectedId(track.id) }} aria-label={`Select ${track.title}`} aria-pressed={isSelected}>
                      <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="track-info"><strong>{track.title}</strong><small>{track.mood} <b>•</b> {track.bpm} BPM</small></span>
                      <Waveform seed={index + 2} active={isPreviewing} />
                      <span className="track-duration">{formatTime(track.durationSec)}</span>
                    </button>
                    <button className="preview-button" onClick={() => void preview(track)} aria-label={isPreviewing ? `Stop preview of ${track.title}` : `Preview ${track.title}`} title={isPreviewing ? 'Stop preview' : 'Preview track'}>{isPreviewing ? '■' : '▶'}</button>
                  </article>
                )
              })}
            </div>
            <button className="start-button" onClick={() => void startFight()} disabled={!selected || !webglOk}>
              <span>START THE FIGHT</span><span className="start-arrow">↗</span>
            </button>
            <div className="start-caption"><span>◈</span> HEADPHONES RECOMMENDED <span className="caption-divider">/</span> PRESS START TO ENABLE SOUND</div>
            {error && <p className="inline-error" role="alert">{error}</p>}
            {!webglOk && <p className="inline-error" role="alert">This device needs WebGL2 to show the 3D arena. Try an updated browser or device.</p>}
          </section>
        </main>
      )}

      {phase === 'loading' && <main className="center-overlay" role="status"><div className="loading-orbit">✦</div><span>PREPARING THE ARENA</span><h2>Feel the build-up.</h2></main>}
      {phase === 'error' && <main className="center-overlay" role="alert"><span>THE SET WAS INTERRUPTED</span><h2>Something missed a beat.</h2><p>{error}</p><button className="start-button narrow" onClick={backToMenu}>BACK TO TRACKS <span>↗</span></button></main>}

      {inFight && (
        <main className="fight-ui">
          <div className="fight-top">
            <div className="now-playing"><span className="playing-icon">♫</span><span><small>NOW PLAYING</small><strong>{selected?.title}</strong></span><span className="track-bpm">{selected?.bpm} BPM</span></div>
            <div className="fight-controls">
              <button onClick={() => setSettings(s => ({ ...s, muted: !s.muted }))} aria-label={settings.muted ? 'Unmute' : 'Mute'}>{settings.muted ? 'MUTED' : 'SOUND ON'}</button>
              <button onClick={() => setShowSettings(v => !v)} aria-label="Settings">SETTINGS</button>
              <button onClick={backToMenu} aria-label="Choose another track">CHANGE TRACK ↗</button>
            </div>
          </div>
          <div className="fight-side"><span className="fight-label">STYLE METER</span><strong>{String(combo).padStart(2, '0')}<small> HIT COMBO</small></strong><span className="fight-side-rule" /><p>THE FLOOR<br />IS YOURS.</p></div>
          <div className="transport">
            <button className="transport-play" onClick={() => phase === 'playing' ? pause() : void resume()} aria-label={phase === 'playing' ? 'Pause fight' : 'Resume fight'}>{phase === 'playing' ? 'Ⅱ' : '▶'}</button>
            <span className="transport-time">{formatTime(songTime)}</span>
            <div className="progress-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Song progress"><div style={{ width: `${progress}%` }} /></div>
            <span className="transport-time">{formatTime(selected?.durationSec ?? 0)}</span>
          </div>
          {phase === 'paused' && <div className="pause-screen"><span>INTERMISSION</span><h2>THE BEAT<br /><em>WAITS FOR YOU.</em></h2><button className="start-button narrow" onClick={() => void resume()}>RESUME FIGHT <span>▶</span></button><button className="text-button" onClick={backToMenu}>CHOOSE ANOTHER TRACK</button></div>}
          {phase === 'finished' && <div className="pause-screen"><span>SET COMPLETE</span><h2>YOU OWNED<br /><em>THE NIGHT.</em></h2><p>{combo} moves. One unforgettable set.</p><button className="start-button narrow" onClick={() => void startFight()}>RUN IT BACK <span>↗</span></button><button className="text-button" onClick={backToMenu}>CHOOSE ANOTHER TRACK</button></div>}
        </main>
      )}

      {showSettings && <div className="settings-panel" role="dialog" aria-label="Game settings">
        <div className="settings-heading"><strong>CONTROL ROOM</strong><button onClick={() => setShowSettings(false)} aria-label="Close settings">×</button></div>
        <label>VOLUME <span>{Math.round(settings.volume * 100)}%</span><input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={e => setSettings(s => ({ ...s, volume: Number(e.target.value) }))} /></label>
        <label>IMPACT EFFECTS <span>{Math.round(settings.effectsVolume * 100)}%</span><input type="range" min="0" max="1" step="0.05" value={settings.effectsVolume} onChange={e => setSettings(s => ({ ...s, effectsVolume: Number(e.target.value) }))} /></label>
        <label className="check-label"><input type="checkbox" checked={settings.reducedMotion} onChange={e => setSettings(s => ({ ...s, reducedMotion: e.target.checked }))} /> REDUCED MOTION</label>
        <label className="check-label"><input type="checkbox" checked={settings.reducedFlash} onChange={e => setSettings(s => ({ ...s, reducedFlash: e.target.checked }))} /> REDUCED FLASH</label>
        <label>VISUAL QUALITY<select value={settings.quality} onChange={e => setSettings(s => ({ ...s, quality: e.target.value as Quality }))}><option value="low">Low / mobile</option><option value="high">High / desktop</option></select></label>
        <button className="reset-button" onClick={resetPreferences}>RESET PREFERENCES</button>
      </div>}

      {panel && <div className="modal-backdrop" onClick={() => setPanel(null)}><div className="info-modal" role="dialog" aria-modal="true" aria-label={panel} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setPanel(null)} aria-label="Close">×</button>
        {panel === 'help' && <><span className="modal-kicker">THE RULES OF THE FLOOR</span><h2>LET THE MUSIC FIGHT.</h2><p>Choose an original track, then hit Start Fight. Your hero battles automatically in time with the music. Use Pause, volume, and the settings panel whenever you like.</p><p>The light show is designed to avoid rapid full-screen flashes. Reduced Flash and Reduced Motion are available in Settings. Press Space to pause or resume when the page itself has focus.</p></>}
        {panel === 'credits' && <><span className="modal-kicker">CREDITS</span><h2>MADE FOR THE BEAT.</h2><p>Original demo music, code-generated effects, characters, and venue were created for Fight Till Beat. Final public credits and rights review will be completed before production release.</p><ul>{tracks.map(track => <li key={track.id}>{track.title} — {track.artist}</li>)}</ul></>}
        {panel === 'privacy' && <><span className="modal-kicker">PRIVACY PREVIEW</span><h2>YOUR SET, YOUR SPACE.</h2><p>This preview is operated by Neeraj Saini. It has no account, ads, or analytics. It stores only your volume, quality, and motion/flash preferences in your browser. Reset them in Settings.</p><p>The hosting provider may process request information such as IP address for delivery and security. A business contact address and full public privacy notice will be completed before production release.</p></>}
      </div></div>}

      <footer className="footer"><span>© {new Date().getFullYear()} FIGHT TILL BEAT <b>•</b> ORIGINAL DEMO</span><div><button onClick={() => setPanel('credits')}>CREDITS</button><button onClick={() => setPanel('privacy')}>PRIVACY</button><span className="footer-spark">✦</span></div></footer>
    </div>
  )
}
