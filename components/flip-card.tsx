"use client"

import { useState, useEffect } from "react"

interface FlipCardProps {
  emoji: string
  isRevealed: boolean
  isMatched: boolean
  isWrongMatch: boolean
  onClick: () => void
  disabled: boolean
  shuffleDelay?: number
  isShuffling?: boolean
}

export function FlipCard({
  emoji,
  isRevealed,
  isMatched,
  isWrongMatch,
  onClick,
  disabled,
  shuffleDelay = 0,
  isShuffling = false,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  const [hasShuffled, setHasShuffled] = useState(!isShuffling) // Start as true if not shuffling

  // Handle flip state
  useEffect(() => {
    setIsFlipped(isRevealed || isMatched)
  }, [isRevealed, isMatched])

  // Handle match animation
  useEffect(() => {
    if (isMatched) {
      setAnimationClass("flip-card-matched")
      const timer = setTimeout(() => setAnimationClass(""), 500)
      return () => clearTimeout(timer)
    }
  }, [isMatched])

  // Handle wrong match animation
  useEffect(() => {
    if (isWrongMatch) {
      setAnimationClass("flip-card-wrong")
      const timer = setTimeout(() => setAnimationClass(""), 500)
      return () => clearTimeout(timer)
    }
  }, [isWrongMatch])

  // Handle shuffle animation
  useEffect(() => {
    if (isShuffling) {
      setHasShuffled(false)
      const timer = setTimeout(() => {
        setHasShuffled(true)
      }, shuffleDelay + 800) // Add animation duration to delay
      return () => clearTimeout(timer)
    } else {
      setHasShuffled(true)
    }
  }, [isShuffling, shuffleDelay])

  const handleClick = () => {
    if (!disabled && !isFlipped && hasShuffled) {
      onClick()
    }
  }

  const getShuffleClass = () => {
    if (!isShuffling) return ""
    if (!hasShuffled) return "card-shuffle-animation opacity-0"
    return ""
  }

  const getDelayClass = () => {
    if (!isShuffling || hasShuffled) return ""
    return `shuffle-delay-${Math.min(shuffleDelay / 100, 30)}`
  }

  const isCardDisabled = disabled || (isShuffling && !hasShuffled)

  return (
    <div
      className={`flip-card aspect-square ${isCardDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
        isFlipped ? "flipped" : ""
      } ${animationClass} ${getShuffleClass()} ${getDelayClass()}`}
      onClick={handleClick}
      style={{
        animationDelay: isShuffling && !hasShuffled ? `${shuffleDelay}ms` : undefined,
      }}
    >
      <div className="flip-card-inner">
        {/* Front of card (hidden state) */}
        <div className="flip-card-front">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30"></div>
          </div>
        </div>

        {/* Back of card (revealed state) */}
        <div className={`flip-card-back ${isMatched ? "flip-card-matched" : ""}`}>
          <span className="text-3xl sm:text-4xl md:text-5xl select-none">{emoji}</span>
        </div>
      </div>
    </div>
  )
}
