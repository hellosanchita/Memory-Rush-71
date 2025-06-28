"use client"

import { useEffect, useCallback } from "react"
import { gameAnalytics } from "../lib/analytics"

export function useAnalytics() {
  // Initialize analytics on component mount
  useEffect(() => {
    gameAnalytics.startSession(1)

    // Cleanup old sessions periodically
    gameAnalytics.cleanupOldSessions()
  }, [])

  const trackLevelComplete = useCallback((level: number, timeRemaining: number, totalTime: number) => {
    gameAnalytics.completeSession(level, timeRemaining, totalTime)
  }, [])

  const trackGameOver = useCallback((level: number, totalTime: number) => {
    gameAnalytics.gameOver(level, totalTime)
  }, [])

  const trackNewGame = useCallback((level: number) => {
    gameAnalytics.startSession(level)
  }, [])

  const getAnalytics = useCallback(() => {
    return gameAnalytics.getAnalytics()
  }, [])

  const exportAnalytics = useCallback(() => {
    return gameAnalytics.exportData()
  }, [])

  const resetAnalytics = useCallback(() => {
    gameAnalytics.resetAnalytics()
  }, [])

  return {
    trackLevelComplete,
    trackGameOver,
    trackNewGame,
    getAnalytics,
    exportAnalytics,
    resetAnalytics,
  }
}
