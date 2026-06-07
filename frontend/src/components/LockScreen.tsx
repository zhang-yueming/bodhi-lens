import { useState } from 'react'

// 🔑 Change this to your desired password
const APP_PASSWORD = 'bodhi2024'

const OUTER_COUNT = 12
const INNER_COUNT = 7

const OUTER_ANGLES = Array.from({ length: OUTER_COUNT }, (_, i) => i * (360 / OUTER_COUNT))
const INNER_ANGLES = Array.from({ length: INNER_COUNT }, (_, i) => i * (360 / INNER_COUNT))

type Phase = 'idle' | 'wrong' | 'opening' | 'fading'

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [val, setVal] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')

  const tryOpen = () => {
    if (phase !== 'idle') return
    if (val === APP_PASSWORD) {
      setPhase('opening')
      setTimeout(() => setPhase('fading'), 1900)
      setTimeout(onUnlock, 2600)
    } else {
      setVal('')
      setPhase('wrong')
      setTimeout(() => setPhase('idle'), 700)
    }
  }

  const opening = phase === 'opening' || phase === 'fading'

  const lotusAnim =
    phase === 'wrong' ? 'lsShake 0.65s ease' :
    opening           ? 'none' :
                        'lsBreathe 5s ease-in-out infinite'

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="ls-bg"
        style={{ opacity: phase === 'fading' ? 0 : 1 }}
      >
        <div className="ls-title">菩提镜 · Bodhi Lens</div>

        {/* Lotus */}
        <div style={{ animation: lotusAnim }}>
          <svg
            width="300" height="300"
            viewBox="-150 -150 300 300"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Outer petal: deep-pink at base → pale pink at tip */}
              <radialGradient id="og" cx="50%" cy="95%" r="100%" gradientUnits="objectBoundingBox">
                <stop offset="0%"   stopColor="#fce4ec" />
                <stop offset="35%"  stopColor="#ec407a" />
                <stop offset="100%" stopColor="#880e4f" />
              </radialGradient>

              {/* Inner petal: white → blush */}
              <radialGradient id="ig" cx="50%" cy="95%" r="100%" gradientUnits="objectBoundingBox">
                <stop offset="0%"   stopColor="#ffffff" />
                <stop offset="45%"  stopColor="#f8bbd0" />
                <stop offset="100%" stopColor="#e91e63" />
              </radialGradient>

              {/* Center: gold */}
              <radialGradient id="cg" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#fff9c4" />
                <stop offset="65%"  stopColor="#ffd54f" />
                <stop offset="100%" stopColor="#f9a825" />
              </radialGradient>

              {/* Soft ambient glow filter */}
              <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="petalGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ambient pond glow when open */}
            <ellipse
              cx="0" cy="0" rx="120" ry="120"
              fill="rgba(236,64,122,0.06)"
              style={{
                opacity: opening ? 1 : 0,
                filter: 'blur(24px)',
                transition: 'opacity 1s ease 0.5s',
              }}
            />

            {/* ── Outer ring of petals ── */}
            {OUTER_ANGLES.map((angle, i) => (
              <g
                key={`o${i}`}
                style={{
                  transformOrigin: '0px 0px',
                  // closed: all overlap at 0°; open: spread to natural angle
                  transform: opening
                    ? `rotate(${angle}deg) translate(0px, -22px)`
                    : 'none',
                  transition: opening
                    ? `transform 1.3s cubic-bezier(0.34,1.56,0.64,1) ${0.22 + i * 0.04}s`
                    : 'none',
                }}
              >
                {/* Outer petal shape: base at origin, tip at y=-100 */}
                <path
                  d="M 0 0 C 21 -8 23 -68 0 -100 C -23 -68 -21 -8 0 0"
                  fill="url(#og)"
                  opacity="0.86"
                  filter={opening ? 'url(#petalGlow)' : undefined}
                />
              </g>
            ))}

            {/* ── Inner ring of petals ── */}
            {INNER_ANGLES.map((angle, i) => (
              <g
                key={`in${i}`}
                style={{
                  transformOrigin: '0px 0px',
                  transform: opening
                    ? `rotate(${angle}deg) translate(0px, -12px)`
                    : 'none',
                  transition: opening
                    ? `transform 1.0s cubic-bezier(0.34,1.56,0.64,1) ${0.06 + i * 0.05}s`
                    : 'none',
                }}
              >
                {/* Inner petal: shorter and slightly narrower */}
                <path
                  d="M 0 0 C 14 -5 15 -44 0 -64 C -15 -44 -14 -5 0 0"
                  fill="url(#ig)"
                  opacity="0.93"
                />
              </g>
            ))}

            {/* ── Center seed pod ── */}
            <g style={{
              transform: opening ? 'scale(1.5)' : 'scale(1)',
              transformOrigin: '0px 0px',
              transition: 'transform 0.8s ease 0.6s',
            }}>
              <circle
                cx="0" cy="0" r="11"
                fill="url(#cg)"
                filter={opening ? 'url(#glow)' : undefined}
              />
            </g>

            {/* Stamens: small dots around center, appear after opening */}
            {OUTER_ANGLES.filter((_, i) => i % 2 === 0).map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x = Math.sin(rad) * 24
              const y = -Math.cos(rad) * 24
              return (
                <circle
                  key={`s${i}`}
                  cx={x} cy={y}
                  r="2"
                  fill="#ffd54f"
                  style={{
                    opacity: opening ? 0.75 : 0,
                    transition: `opacity 0.4s ease ${0.9 + i * 0.08}s`,
                  }}
                />
              )
            })}
          </svg>
        </div>

        {/* Password input */}
        <input
          className="ls-input"
          type="password"
          value={val}
          autoFocus
          disabled={opening}
          placeholder="· · · · · · · ·"
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryOpen()}
          style={{
            borderColor: phase === 'wrong'
              ? 'rgba(255, 90, 90, 0.65)'
              : undefined,
            boxShadow: phase === 'wrong'
              ? '0 0 14px rgba(255, 80, 80, 0.15)'
              : undefined,
          }}
        />

        <div className="ls-hint">按 Enter 进入</div>
      </div>
    </>
  )
}

const STYLES = `
  .ls-bg {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
    background: radial-gradient(ellipse at 50% 52%, #0e1d2e 0%, #060c14 80%);
    transition: opacity 0.65s ease;
    pointer-events: auto;
    user-select: none;
  }

  .ls-title {
    color: rgba(255, 255, 255, 0.3);
    font-size: 13px;
    letter-spacing: 8px;
    font-weight: 300;
    font-family: Georgia, 'Times New Roman', serif;
  }

  .ls-input {
    width: 210px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 2px;
    color: rgba(255, 255, 255, 0.75);
    font-size: 18px;
    letter-spacing: 5px;
    text-align: center;
    padding: 13px 20px;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
    font-family: Georgia, serif;
  }

  .ls-input::placeholder {
    color: rgba(255, 255, 255, 0.18);
    letter-spacing: 5px;
    font-size: 14px;
  }

  .ls-input:focus {
    border-color: rgba(236, 64, 122, 0.38) !important;
    box-shadow: 0 0 14px rgba(236, 64, 122, 0.1) !important;
  }

  .ls-hint {
    color: rgba(255, 255, 255, 0.14);
    font-size: 11px;
    letter-spacing: 3px;
    font-family: Georgia, serif;
    margin-top: -16px;
  }

  @keyframes lsBreathe {
    0%,  100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(236,64,122,0.15)); }
    50%        { transform: scale(1.022); filter: drop-shadow(0 0 14px rgba(236,64,122,0.3)); }
  }

  @keyframes lsShake {
    0%,  100% { transform: translateX(0); }
    15%        { transform: translateX(-10px); }
    30%        { transform: translateX(9px); }
    45%        { transform: translateX(-7px); }
    60%        { transform: translateX(6px); }
    78%        { transform: translateX(-4px); }
    90%        { transform: translateX(3px); }
  }
`
