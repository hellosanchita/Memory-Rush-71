"use client"

import { useEffect, useState } from "react"

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  size: number
  shape: "circle" | "square" | "triangle"
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ]

  const createConfettiPiece = (id: number): ConfettiPiece => ({
    id,
    x: Math.random() * window.innerWidth,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    shape: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)] as "circle" | "square" | "triangle",
  })

  useEffect(() => {
    if (active && !isAnimating) {
      setIsAnimating(true)

      // Create initial burst of confetti
      const initialPieces = Array.from({ length: 50 }, (_, i) => createConfettiPiece(i))
      setPieces(initialPieces)

      // Add more pieces over time for a continuous effect
      const intervals: NodeJS.Timeout[] = []

      for (let i = 0; i < 8; i++) {
        const timeout = setTimeout(() => {
          setPieces((prev) => [...prev, ...Array.from({ length: 15 }, (_, j) => createConfettiPiece(prev.length + j))])
        }, i * 200)
        intervals.push(timeout)
      }

      // Clean up after animation
      const cleanup = setTimeout(() => {
        setIsAnimating(false)
        setPieces([])
        onComplete?.()
      }, 4000)

      return () => {
        intervals.forEach(clearTimeout)
        clearTimeout(cleanup)
      }
    }
  }, [active, isAnimating, onComplete])

  useEffect(() => {
    if (!isAnimating || pieces.length === 0) return

    const animationFrame = requestAnimationFrame(() => {
      setPieces(
        (prevPieces) =>
          prevPieces
            .map((piece) => ({
              ...piece,
              x: piece.x + piece.vx,
              y: piece.y + piece.vy,
              vy: piece.vy + 0.1, // gravity
              rotation: piece.rotation + piece.rotationSpeed,
            }))
            .filter((piece) => piece.y < window.innerHeight + 50), // Remove pieces that fall off screen
      )
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [pieces, isAnimating])

  if (!isAnimating) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => {
        const transform = `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotation}deg)`

        return (
          <div
            key={piece.id}
            className="absolute"
            style={{
              transform,
              width: piece.size,
              height: piece.size,
            }}
          >
            {piece.shape === "circle" && (
              <div className="w-full h-full rounded-full" style={{ backgroundColor: piece.color }} />
            )}
            {piece.shape === "square" && <div className="w-full h-full" style={{ backgroundColor: piece.color }} />}
            {piece.shape === "triangle" && (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: `${piece.size / 2}px solid transparent`,
                  borderRight: `${piece.size / 2}px solid transparent`,
                  borderBottom: `${piece.size}px solid ${piece.color}`,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
