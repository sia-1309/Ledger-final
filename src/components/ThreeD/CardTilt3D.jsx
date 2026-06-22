export default function CardTilt3D({ children, className = '' }) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    e.currentTarget.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-200 ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}
