"use client"

import { useState, useEffect, useCallback } from "react"

export interface LeaderboardEntry {
  id: string
  playerName: string
  highestLevel: number
  bestTimes: { [level: number]: number }
  totalScore: number
  gamesPlayed: number
  dateAchieved: string
  avatar?: string
}

// Mock leaderboard data for demonstration
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "1",
    playerName: "MemoryMaster",
    highestLevel: 8,
    bestTimes: { 1: 25, 2: 35, 3: 42, 4: 38, 5: 45 },
    totalScore: 2850,
    gamesPlayed: 45,
    dateAchieved: "2024-01-15T10:30:00Z",
    avatar: "🧠",
  },
  {
    id: "2",
    playerName: "SpeedRunner",
    highestLevel: 7,
    bestTimes: { 1: 18, 2: 28, 3: 35, 4: 42 },
    totalScore: 2650,
    gamesPlayed: 32,
    dateAchieved: "2024-01-14T15:45:00Z",
    avatar: "⚡",
  },
  {
    id: "3",
    playerName: "RushExpert",
    highestLevel: 6,
    bestTimes: { 1: 22, 2: 31, 3: 38, 4: 45 },
    totalScore: 2400,
    gamesPlayed: 28,
    dateAchieved: "2024-01-13T09:15:00Z",
    avatar: "🚀",
  },
  {
    id: "4",
    playerName: "CardShark",
    highestLevel: 6,
    bestTimes: { 1: 30, 2: 40, 3: 48 },
    totalScore: 2200,
    gamesPlayed: 38,
    dateAchieved: "2024-01-12T14:20:00Z",
    avatar: "🎯",
  },
  {
    id: "5",
    playerName: "TimeKeeper",
    highestLevel: 5,
    bestTimes: { 1: 35, 2: 45, 3: 52 },
    totalScore: 1950,
    gamesPlayed: 25,
    dateAchieved: "2024-01-11T11:30:00Z",
    avatar: "⏰",
  },
]

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerName, setPlayerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [playerEntry, setPlayerEntry] = useState<LeaderboardEntry | null>(null)

  // Load player name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("memoryRushPlayerName")
      if (savedName) {
        setPlayerName(savedName)
      }
    }
  }, [])

  // Load leaderboard data (in real app, this would be from an API)
  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Load mock data and any local player data
    let combinedData = [...MOCK_LEADERBOARD]

    if (typeof window !== "undefined") {
      const localPlayerData = localStorage.getItem("memoryRushPlayerEntry")
      if (localPlayerData) {
        try {
          const playerData = JSON.parse(localPlayerData)
          // Remove any existing entry for this player and add the updated one
          combinedData = combinedData.filter((entry) => entry.playerName !== playerData.playerName)
          combinedData.push(playerData)
        } catch (error) {
          console.log("Failed to load player data:", error)
        }
      }
    }

    // Sort by total score (highest first)
    combinedData.sort((a, b) => b.totalScore - a.totalScore)

    setLeaderboard(combinedData)
    setIsLoading(false)
  }, [])

  // Submit score to leaderboard
  const submitScore = useCallback(
    async (highestLevel: number, bestTimes: { [level: number]: number }, gamesPlayed: number) => {
      if (!playerName.trim()) return false

      // Calculate total score based on levels and times
      const totalScore = calculateTotalScore(highestLevel, bestTimes)

      const newEntry: LeaderboardEntry = {
        id: `player_${Date.now()}`,
        playerName: playerName.trim(),
        highestLevel,
        bestTimes,
        totalScore,
        gamesPlayed,
        dateAchieved: new Date().toISOString(),
        avatar: getRandomAvatar(),
      }

      // Save to localStorage (in real app, this would be sent to server)
      if (typeof window !== "undefined") {
        localStorage.setItem("memoryRushPlayerEntry", JSON.stringify(newEntry))
        localStorage.setItem("memoryRushPlayerName", playerName.trim())
      }

      setPlayerEntry(newEntry)
      await loadLeaderboard()
      return true
    },
    [playerName, loadLeaderboard],
  )

  // Calculate total score based on performance
  const calculateTotalScore = (highestLevel: number, bestTimes: { [level: number]: number }) => {
    let score = highestLevel * 100 // Base score for reaching levels

    // Bonus points for fast completion times
    Object.entries(bestTimes).forEach(([level, time]) => {
      const levelNum = Number.parseInt(level)
      const maxTime = getMaxTimeForLevel(levelNum)
      const timeBonus = Math.max(0, maxTime - time) * 10
      score += timeBonus
    })

    return score
  }

  const getMaxTimeForLevel = (level: number) => {
    const configs = { 1: 60, 2: 50, 3: 45, 4: 40, 5: 35 }
    return configs[level] || 35
  }

  const getRandomAvatar = () => {
    const avatars = ["🧠", "⚡", "🚀", "🎯", "⏰", "🏆", "🎮", "🔥", "💎", "⭐"]
    return avatars[Math.floor(Math.random() * avatars.length)]
  }

  // Get player's rank
  const getPlayerRank = useCallback(() => {
    if (!playerEntry) return null
    const index = leaderboard.findIndex((entry) => entry.id === playerEntry.id)
    return index >= 0 ? index + 1 : null
  }, [leaderboard, playerEntry])

  // Share leaderboard
  const shareLeaderboard = useCallback(async () => {
    const rank = getPlayerRank()
    const shareText = rank
      ? `I'm ranked #${rank} on Memory Rush leaderboard! 🏆 Level ${playerEntry?.highestLevel} reached with ${playerEntry?.totalScore} points!`
      : `Check out the Memory Rush leaderboard! Can you beat the top players?`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Memory Rush Leaderboard",
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share failed:", error)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
      return "copied"
    }
  }, [getPlayerRank, playerEntry])

  return {
    leaderboard,
    playerName,
    setPlayerName,
    isLoading,
    playerEntry,
    loadLeaderboard,
    submitScore,
    getPlayerRank,
    shareLeaderboard,
  }
}
