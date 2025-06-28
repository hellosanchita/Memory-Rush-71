"use client"

import { useState, useEffect, useCallback } from "react"

interface HighScoreData {
  highestLevel: number
  levelTimes: { [level: number]: number }
  totalGamesPlayed: number
  lastPlayed: string
}

const DEFAULT_HIGH_SCORE: HighScoreData = {
  highestLevel: 1,
  levelTimes: {},
  totalGamesPlayed: 0,
  lastPlayed: new Date().toISOString(),
}

export function useHighScore() {
  const [highScore, setHighScore] = useState<HighScoreData>(DEFAULT_HIGH_SCORE)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  // Load high score from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("memoryRushHighScore")
        if (saved) {
          const parsed = JSON.parse(saved)
          setHighScore({ ...DEFAULT_HIGH_SCORE, ...parsed })
        }
      } catch (error) {
        console.log("Failed to load high score:", error)
      }
    }
  }, [])

  // Save high score to localStorage
  const saveHighScore = useCallback((newHighScore: HighScoreData) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("memoryRushHighScore", JSON.stringify(newHighScore))
        setHighScore(newHighScore)
      } catch (error) {
        console.log("Failed to save high score:", error)
      }
    }
  }, [])

  // ---- replace the four callbacks with the code below ----
  // ⬇⬇ NEW STABLE CALLBACKS ⬇⬇
  const updateHighestLevel = useCallback((level: number) => {
    setHighScore((prev) => {
      if (level <= prev.highestLevel) return prev // nothing to do
      setIsNewHighScore(true)
      // clear banner after 3 s
      setTimeout(() => setIsNewHighScore(false), 3000)

      const next = { ...prev, highestLevel: level, lastPlayed: new Date().toISOString() }
      if (typeof window !== "undefined") {
        localStorage.setItem("memoryRushHighScore", JSON.stringify(next))
      }
      return next
    })
  }, []) //  <--  stays the same object forever

  const updateLevelTime = useCallback((level: number, timeRemaining: number, totalTime: number) => {
    const timeTaken = totalTime - timeRemaining
    setHighScore((prev) => {
      const currentBest = prev.levelTimes[level]
      if (currentBest && currentBest <= timeTaken) return prev

      const next = {
        ...prev,
        levelTimes: { ...prev.levelTimes, [level]: timeTaken },
        lastPlayed: new Date().toISOString(),
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("memoryRushHighScore", JSON.stringify(next))
      }
      return next
    })
  }, [])

  const incrementGamesPlayed = useCallback(() => {
    setHighScore((prev) => {
      const next = {
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        lastPlayed: new Date().toISOString(),
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("memoryRushHighScore", JSON.stringify(next))
      }
      return next
    })
  }, [])

  const resetHighScores = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("memoryRushHighScore", JSON.stringify(DEFAULT_HIGH_SCORE))
    }
    setHighScore(DEFAULT_HIGH_SCORE)
  }, [])
  // ---- end replacement ----

  // Get best time for a level
  const getBestTimeForLevel = useCallback(
    (level: number) => {
      return highScore.levelTimes[level] || null
    },
    [highScore.levelTimes],
  )

  return {
    highScore,
    isNewHighScore,
    updateHighestLevel,
    updateLevelTime,
    incrementGamesPlayed,
    getBestTimeForLevel,
    resetHighScores,
  }
}
