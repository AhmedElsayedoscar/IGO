import { useEffect, useRef, useState } from 'react'

const WINTER_TRACK = `${import.meta.env.BASE_URL}audio/scott-buckley-snowfall.mp3`
const DEFAULT_VOLUME = 0.14

function safeSessionGet(key) {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSessionSet(key, value) {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable in private browsing; the controls still work for this render.
  }
}

export function WinterAtmosphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let frameId = 0
    let running = false
    let visible = !document.hidden
    let previousTime = 0
    let flakes = []

    const makeFlake = (startAnywhere = false) => {
      const depth = Math.random()
      return {
        x: Math.random() * Math.max(1, width),
        y: startAnywhere ? Math.random() * Math.max(1, height) : -Math.random() * Math.max(1, height),
        radius: 0.55 + depth * 2.3,
        speed: 13 + depth * 31,
        sway: 4 + depth * 16,
        opacity: 0.14 + depth * 0.4,
        depth: 0.25 + depth * 0.85,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.35 + Math.random() * 0.8,
      }
    }

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.25 : 1.6)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const targetCount = width < 640 ? 38 : width < 1024 ? 68 : 104
      flakes = Array.from({ length: targetCount }, () => makeFlake(true))
      if (reducedMotion.matches) context.clearRect(0, 0, width, height)
      else start()
    }

    const draw = (timestamp) => {
      if (!running || reducedMotion.matches || !visible) return
      const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.05) : 0.016
      previousTime = timestamp
      context.clearRect(0, 0, width, height)

      const slowWind = Math.sin(timestamp * 0.00014) * 11
      const shiftingGust = Math.sin(timestamp * 0.00031 + 1.7) * 5
      const wind = slowWind + shiftingGust

      for (const flake of flakes) {
        flake.y += flake.speed * delta
        flake.phase += flake.phaseSpeed * delta
        flake.x += (wind * flake.depth + Math.sin(flake.phase) * flake.sway) * delta

        if (flake.y > height + 8) {
          flake.y = -8 - Math.random() * 24
          flake.x = Math.random() * width
        }
        if (flake.x < -12) flake.x = width + 8
        if (flake.x > width + 12) flake.x = -8

        context.globalAlpha = flake.opacity
        context.fillStyle = '#eaf5ff'
        context.beginPath()
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        context.fill()

        if (flake.radius > 2.15) {
          context.globalAlpha = flake.opacity * 0.18
          context.beginPath()
          context.arc(flake.x, flake.y, flake.radius * 2.6, 0, Math.PI * 2)
          context.fill()
        }
      }

      context.globalAlpha = 1
      frameId = window.requestAnimationFrame(draw)
    }

    function start() {
      if (running || reducedMotion.matches || !visible) return
      running = true
      previousTime = 0
      frameId = window.requestAnimationFrame(draw)
    }

    function stop() {
      running = false
      if (frameId) window.cancelAnimationFrame(frameId)
      frameId = 0
      previousTime = 0
      context.clearRect(0, 0, width, height)
    }

    const handleVisibility = () => {
      visible = !document.hidden
      if (visible) start()
      else stop()
    }

    const handleMotionPreference = () => {
      if (reducedMotion.matches) stop()
      else start()
    }

    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    reducedMotion.addEventListener?.('change', handleMotionPreference)
    resize()

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
      reducedMotion.removeEventListener?.('change', handleMotionPreference)
    }
  }, [])

  return (
    <div className="winter-atmosphere" aria-hidden="true">
      <canvas ref={canvasRef} className="winter-snowfall-canvas" />
    </div>
  )
}

export function WinterMusicPlayer() {
  const audioRef = useRef(null)
  const savedVolumeValue = safeSessionGet('igo_winter_music_volume')
  const savedVolume = savedVolumeValue === null ? Number.NaN : Number(savedVolumeValue)
  const [volume, setVolume] = useState(() => (
    Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1 ? savedVolume : DEFAULT_VOLUME
  ))
  const [muted, setMuted] = useState(() => safeSessionGet('igo_winter_music_muted') === 'true')
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
      audio.muted = muted
    }
    safeSessionSet('igo_winter_music_volume', String(volume))
    safeSessionSet('igo_winter_music_muted', String(muted))
  }, [volume, muted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    const handlePlay = () => {
      setUnavailable(false)
      setPlaying(true)
    }
    const handlePause = () => setPlaying(false)
    const handleError = () => {
      setPlaying(false)
      setUnavailable(true)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)
    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      audio.pause()
      return
    }

    setUnavailable(false)
    audio.volume = volume
    audio.muted = muted
    try {
      await audio.play()
    } catch {
      setPlaying(false)
      setUnavailable(true)
    }
  }

  const toggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (audioRef.current) audioRef.current.muted = nextMuted
  }

  return (
    <aside className={`winter-music-player${expanded ? ' is-expanded' : ''}`} aria-label="موسيقى الأجواء الشتوية">
      <audio ref={audioRef} src={WINTER_TRACK} preload="none" loop aria-hidden="true" tabIndex={-1} />
      <button
        type="button"
        className="winter-audio-play"
        onClick={togglePlayback}
        aria-label={playing ? 'إيقاف موسيقى الشتاء' : 'تشغيل موسيقى الشتاء'}
        title={playing ? 'إيقاف' : 'تشغيل موسيقى الشتاء'}
      >
        <span aria-hidden="true">{playing ? 'Ⅱ' : '♫'}</span>
      </button>

      <div className="winter-audio-copy">
        <small>WINTER SOUNDTRACK</small>
        <strong className={unavailable ? 'winter-audio-error' : ''}>
          {unavailable ? 'الموسيقى غير متاحة حالياً' : 'Snowfall · موسيقى شتوية'}
        </strong>
        <span className="winter-audio-credit">
          <a href="https://soundcloud.com/scottbuckley" target="_blank" rel="noreferrer">Scott Buckley</a>
          <span>·</span>
          <a href="https://www.free-stock-music.com/scott-buckley-snowfall.html" target="_blank" rel="noreferrer">Free Stock Music</a>
          <span>·</span>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
        </span>
      </div>

      <button
        type="button"
        className="winter-audio-expand"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="winter-audio-options"
        aria-label={expanded ? 'إخفاء إعدادات موسيقى الشتاء' : 'إظهار إعدادات موسيقى الشتاء'}
        title={expanded ? 'إخفاء الإعدادات' : 'إعدادات الصوت'}
      >
        <span aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>

      <button
        type="button"
        className="winter-audio-mute"
        onClick={toggleMute}
        aria-label={muted ? 'إلغاء كتم موسيقى الشتاء' : 'كتم موسيقى الشتاء'}
        aria-pressed={muted}
        title={muted ? 'إلغاء الكتم' : 'كتم الصوت'}
      >
        <span aria-hidden="true">{muted ? '×' : '◖'}</span>
      </button>

      <div className="winter-volume-row" id="winter-audio-options">
        <label htmlFor="winter-volume">VOL</label>
        <input
          id="winter-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="مستوى صوت موسيقى الشتاء"
        />
      </div>
    </aside>
  )
}
