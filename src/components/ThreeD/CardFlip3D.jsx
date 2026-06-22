import { useState } from 'react'

export default function CardFlip3D({ front, back, className = '' }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className={`perspective-1000 cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative transition-transform duration-300"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div className="backface-hidden">{front}</div>
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
