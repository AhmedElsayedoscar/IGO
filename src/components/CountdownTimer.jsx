import { useState, useEffect } from 'react'

export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    if (!targetDate) return

    const timer = setInterval(() => {
      const calculated = calculateTimeLeft(targetDate)
      setTimeLeft(calculated)
      if (calculated.total <= 0) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

function calculateTimeLeft(targetDate) {
  if (!targetDate) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }

  const diff = new Date(targetDate).getTime() - new Date().getTime()
  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { total: diff, days, hours, minutes, seconds, isExpired: false }
}

export default function CountdownTimer({ targetDate, compact = false }) {
  const { total, days, hours, minutes, seconds, isExpired } = useCountdown(targetDate)

  if (!targetDate || isExpired || total <= 0) return null

  const pad = (n) => String(n).padStart(2, '0')

  if (compact) {
    return (
      <div className="countdown-pill-compact" title="مدة انتهاء العرض والخصم">
        <span className="flash-bolt">⚡</span>
        <span>ينتهي خلال:</span>
        <strong>
          {days > 0 ? `${days}ي ` : ''}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </strong>
      </div>
    )
  }

  return (
    <div className="countdown-banner-detailed">
      <div className="countdown-header-line">
        <span className="fire-icon">🔥</span>
        <span>عرض خاص لفترة محدودة — ينتهي الخصم خلال:</span>
      </div>
      <div className="countdown-boxes-row">
        {days > 0 && (
          <div className="countdown-box">
            <span className="box-digit">{pad(days)}</span>
            <span className="box-unit">أيام</span>
          </div>
        )}
        <div className="countdown-box">
          <span className="box-digit">{pad(hours)}</span>
          <span className="box-unit">ساعات</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <span className="box-digit">{pad(minutes)}</span>
          <span className="box-unit">دقائق</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <span className="box-digit">{pad(seconds)}</span>
          <span className="box-unit">ثواني</span>
        </div>
      </div>
    </div>
  )
}

