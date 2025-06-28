"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAudio } from "./hooks/use-audio"
import { useHighScore } from "./hooks/use-high-score"
import { Volume2, VolumeX, Trophy, RotateCcw, Share2 } from "lucide-react"
import { MemoryRushLogo } from "./components/memory-rush-logo"
import { Leaderboard } from "./components/leaderboard"
import { CountdownProgress } from "./components/countdown-progress"
import { FlipCard } from "./components/flip-card"
import { SocialShare } from "./components/social-share"
import { Confetti } from "./components/confetti"

export default function Component() {
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameActive, setGameActive] = useState(false) // Start as false
  const [cards, setCards] = useState([])
  const [selectedCards, setSelectedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [totalPairs, setTotalPairs] = useState(0)
  const [wrongMatchCards, setWrongMatchCards] = useState([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [shuffleComplete, setShuffleComplete] = useState(false)
  const [isLevelTransition, setIsLevelTransition] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const { playSound, isMuted, toggleMute, initializeAudio } = useAudio()

  const {
    highScore,
    isNewHighScore,
    updateHighestLevel,
    updateLevelTime,
    incrementGamesPlayed,
    getBestTimeForLevel,
    resetHighScores,
  } = useHighScore()

  // Expanded emoji sets for higher levels
  const emojiSets = {
    1: ["🌞", "🌈", "🍕", "🚀", "🐶", "⚽", "🎉", "🎸"],
    2: ["🌞", "🌈", "🍕", "🚀", "🐶", "⚽", "🎉", "🎸", "🎭", "🎨", "🎪", "🎯"],
    3: ["🌞", "🌈", "🍕", "🚀", "🐶", "⚽", "🎉", "🎸", "🎭", "🎨", "🎪", "🎯", "🎲", "🎮", "🎺", "🎻", "🎼", "🎤"],
    4: [
      "🌞",
      "🌈",
      "🍕",
      "🚀",
      "🐶",
      "⚽",
      "🎉",
      "🎸",
      "🎭",
      "🎨",
      "🎪",
      "🎯",
      "🎲",
      "🎮",
      "🎺",
      "🎻",
      "🎼",
      "🎤",
      "🏆",
      "🏅",
      "🏈",
      "🏀",
      "⚾",
      "🎾",
      "🎳",
      "🎿",
      "🏊",
      "🏃",
      "🚴",
      "🏋️",
      "🤸",
      "🧘",
      "🏌️",
      "🏄",
      "🚣",
      "🏇",
    ],
    5: [
      "🌞",
      "🌈",
      "🍕",
      "🚀",
      "🐶",
      "⚽",
      "🎉",
      "🎸",
      "🎭",
      "🎨",
      "🎪",
      "🎯",
      "🎲",
      "🎮",
      "🎺",
      "🎻",
      "🎼",
      "🎤",
      "🏆",
      "🏅",
      "🏈",
      "🏀",
      "⚾",
      "🎾",
      "🎳",
      "🎿",
      "🏊",
      "🏃",
      "🚴",
      "🏋️",
      "🤸",
      "🧘",
      "🏌️",
      "🏄",
      "🚣",
      "🏇",
      "🍎",
      "🍌",
      "🍇",
      "🍓",
      "🍒",
      "🍑",
      "🥝",
      "🍍",
      "🥭",
      "🍊",
      "🍋",
      "🍈",
      "🍉",
      "🥥",
      "🥑",
      "🍆",
      "🥒",
      "🥬",
    ],
  }

  // Updated level progression as specified
  const getGameConfig = (currentLevel) => {
    const configs = {
      1: { gridSize: 4, timer: 60, pairs: 8, gridDisplay: "4×4" },
      2: { gridSize: 4, timer: 45, pairs: 8, gridDisplay: "4×4" },
      3: { gridSize: 4, timer: 30, pairs: 8, gridDisplay: "4×4" },
      4: { gridSize: 8, timer: 60, pairs: 24, gridDisplay: "6×4" }, // 8×6 grid to fit 24 pairs (48 cards)
      5: { gridSize: 8, timer: 45, pairs: 24, gridDisplay: "6×4" },
      6: { gridSize: 8, timer: 30, pairs: 24, gridDisplay: "6×4" },
      7: { gridSize: 6, timer: 45, pairs: 18, gridDisplay: "6×4" }, // 6×6 grid for 18 pairs (36 cards)
      8: { gridSize: 6, timer: 30, pairs: 12, gridDisplay: "6×4" }, // 6×4 grid for 12 pairs (24 cards)
      9: { gridSize: 9, timer: 60, pairs: 36, gridDisplay: "6×6" }, // 9×8 grid for 36 pairs (72 cards)
      10: { gridSize: 9, timer: 45, pairs: 36, gridDisplay: "6×6" },
      11: { gridSize: 9, timer: 30, pairs: 36, gridDisplay: "6×6" },
    }

    // For level 12+, use this config
    const defaultConfig = { gridSize: 8, timer: 45, pairs: 30, gridDisplay: "6×6" }

    return configs[currentLevel] || defaultConfig
  }

  const initializeGame = useCallback((currentLevel) => {
    console.log("Initializing game for level", currentLevel)
    setIsLevelTransition(false) // Reset transition flag
    setShowConfetti(false) // Reset confetti
    const config = getGameConfig(currentLevel)

    // Get appropriate emoji set based on level
    let availableEmojis
    if (currentLevel <= 3) {
      availableEmojis = emojiSets[1] || emojiSets[1]
    } else if (currentLevel <= 6) {
      availableEmojis = emojiSets[4] || emojiSets[4]
    } else {
      availableEmojis = emojiSets[5] || emojiSets[5]
    }

    const selectedEmojis = availableEmojis.slice(0, config.pairs)

    const gameCards = selectedEmojis
      .flatMap((emoji, index) => [
        { id: index * 2, emoji, matched: false },
        { id: index * 2 + 1, emoji, matched: false },
      ])
      .sort(() => Math.random() - 0.5)

    setCards(gameCards)
    setSelectedCards([])
    setMatchedPairs(0)
    setTotalPairs(config.pairs)
    setTimeLeft(config.timer)
    setWrongMatchCards([])
    setGameStarted(false)

    // Start shuffle animation
    setIsShuffling(true)
    setShuffleComplete(false)
    setGameActive(false) // Disable game during shuffle

    // Complete shuffle after all cards have animated in
    const maxDelay = Math.max(...gameCards.map((_, index) => index * 100))
    const shuffleDuration = maxDelay + 1000 // stagger delay + animation duration + buffer

    setTimeout(() => {
      setIsShuffling(false)
      setShuffleComplete(true)
      // Add a small delay before activating the game to prevent race conditions
      setTimeout(() => {
        setGameActive(true)
        console.log("Game active for level", currentLevel)
      }, 100)
    }, shuffleDuration)
  }, [])

  // Initialize game on component mount and level change
  useEffect(() => {
    initializeGame(level)
  }, [level, initializeGame])

  // Timer countdown (only when game is active and shuffle is complete)
  useEffect(() => {
    if (gameActive && shuffleComplete && gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && shuffleComplete && gameStarted) {
      setGameActive(false)
      playSound("gameOver")
      incrementGamesPlayed()
    }
  }, [timeLeft, gameActive, shuffleComplete, gameStarted, playSound, incrementGamesPlayed])

  // Check for level completion
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0 && !isLevelTransition) {
      setGameActive(false)
      setIsLevelTransition(true) // Prevent multiple level advances
      playSound("levelComplete")

      // Trigger confetti celebration
      setShowConfetti(true)

      // Update high scores - record the level that was just completed
      const config = getGameConfig(level)
      updateLevelTime(level, timeLeft, config.timer)

      // Only update highest level if this level is higher than previous best
      if (level >= highScore.highestLevel) {
        updateHighestLevel(level)
      }

      // Auto-advance to next level after a short delay
      setTimeout(() => {
        setLevel((prev) => {
          const nextLevel = prev + 1
          console.log("Advancing from level", prev, "to level", nextLevel)
          return nextLevel
        })
      }, 2000)
    }
  }, [
    matchedPairs,
    totalPairs,
    playSound,
    level,
    timeLeft,
    updateLevelTime,
    updateHighestLevel,
    highScore.highestLevel,
    isLevelTransition,
  ])

  // Initialize audio on component mount
  useEffect(() => {
    initializeAudio()
  }, [initializeAudio])

  const handleCardClick = (card) => {
    console.log("Card clicked:", card.emoji, "Game active:", gameActive, "Shuffle complete:", shuffleComplete) // Debug log

    if (!gameActive || !shuffleComplete || selectedCards.length >= 2 || card.matched || selectedCards.includes(card)) {
      return
    }

    // Start the game on first card click
    if (!gameStarted) {
      setGameStarted(true)
    }

    const newSelectedCards = [...selectedCards, card]
    setSelectedCards(newSelectedCards)

    if (newSelectedCards.length === 2) {
      if (newSelectedCards[0].emoji === newSelectedCards[1].emoji) {
        // Match found
        playSound("match")
        setCards((prevCards) =>
          prevCards.map((c) =>
            c.id === newSelectedCards[0].id || c.id === newSelectedCards[1].id ? { ...c, matched: true } : c,
          ),
        )
        setSelectedCards([])
        setMatchedPairs((prev) => prev + 1)
      } else {
        // No match - show wrong animation and clear selection after delay
        setWrongMatchCards(newSelectedCards.map((c) => c.id))
        setTimeout(() => {
          setSelectedCards([])
          setWrongMatchCards([])
        }, 1000)
      }
    }
  }

  const handleReset = () => {
    setLevel(1)
    initializeGame(1)
    incrementGamesPlayed()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const config = getGameConfig(level)

  // Determine grid CSS class based on actual grid size needed
  const getGridClass = () => {
    if (config.gridSize <= 4) return "grid-cols-4"
    if (config.gridSize <= 6) return "grid-cols-6"
    if (config.gridSize <= 8) return "grid-cols-8"
    return "grid-cols-9"
  }

  const gridCols = getGridClass()
  const isGameWon = matchedPairs === totalPairs && totalPairs > 0
  const isGameLost = timeLeft === 0 && !isGameWon && shuffleComplete && gameStarted
  const bestTimeForCurrentLevel = getBestTimeForLevel(level)

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-8 bg-background text-foreground min-h-screen">
      {/* Confetti Component */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <Card className="w-full max-w-5xl">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <MemoryRushLogo size={56} />
            <p className="text-muted-foreground text-center max-w-md">
              Match pairs of emojis before time runs out in this fast-paced memory challenge with increasing difficulty!
            </p>
          </div>

          {/* Game Controls and Level Info - Moved to top */}
          <div className="flex justify-center gap-4 flex-wrap mb-4">
            <Button onClick={handleReset} variant="outline" disabled={isShuffling}>
              Reset Game
            </Button>
            {!gameActive && !isGameWon && shuffleComplete && (
              <Button onClick={() => initializeGame(level)}>Try Again</Button>
            )}
            <Leaderboard currentHighScore={highScore} />
            <SocialShare
              shareData={{
                level: highScore.highestLevel,
                gamesPlayed: highScore.totalGamesPlayed,
              }}
              shareType="general"
            />
            <Button onClick={resetHighScores} variant="ghost" size="sm" className="text-muted-foreground">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Scores
            </Button>
          </div>

          {/* Level Details with Visual Difficulty - Moved to top */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">
                Level {level}: {config.gridDisplay} grid • {totalPairs} pairs • {config.timer}s timer
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const getDifficultyLevel = () => {
                  if (level <= 3)
                    return {
                      name: "Beginner",
                      color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                      icon: "🌱",
                    }
                  if (level <= 6)
                    return {
                      name: "Intermediate",
                      color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
                      icon: "🎯",
                    }
                  if (level <= 8)
                    return {
                      name: "Advanced",
                      color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
                      icon: "⚡",
                    }
                  if (level <= 11)
                    return {
                      name: "Expert",
                      color: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
                      icon: "🔥",
                    }
                  return {
                    name: "Master",
                    color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
                    icon: "💀",
                  }
                }
                const difficulty = getDifficultyLevel()
                return (
                  <>
                    <span className="text-lg">{difficulty.icon}</span>
                    <Badge className={`${difficulty.color} border-0 font-semibold text-xs`}>{difficulty.name}</Badge>
                  </>
                )
              })()}
            </div>
          </div>

          {/* High Score Display */}
          <div className="flex justify-center gap-4 mb-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Best Level: {highScore.highestLevel}
            </Badge>
            {bestTimeForCurrentLevel && (
              <Badge variant="outline" className="flex items-center gap-2">
                ⏱️ Level {level} Best: {formatTime(bestTimeForCurrentLevel)}
              </Badge>
            )}
            <Badge variant="outline">Games: {highScore.totalGamesPlayed}</Badge>
          </div>

          {isNewHighScore && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
              <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">NEW HIGH SCORE!</span>
                <Trophy className="h-5 w-5" />
              </div>
            </div>
          )}

          {/* Game Stats and Controls */}
          <div className="flex justify-between items-center mt-4 mb-4">
            <div className="text-lg font-semibold">
              Level: <span className="text-primary">{level}</span>
            </div>
            <div className="text-lg font-semibold">
              Pairs:{" "}
              <span className="text-primary">
                {matchedPairs}/{totalPairs}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Countdown Progress Bar */}
          <div className="mb-4">
            <CountdownProgress timeLeft={timeLeft} totalTime={config.timer} className="max-w-md mx-auto" />
          </div>

          {/* Game Status */}
          <div className="mb-4 text-center">
            {isShuffling && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Shuffling cards...</span>
              </div>
            )}
            {!isShuffling && shuffleComplete && gameActive && !gameStarted && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-blue-700 dark:text-blue-300 font-medium">Click any card to start the timer!</span>
              </div>
            )}
            {!isShuffling && shuffleComplete && gameActive && gameStarted && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Game in progress! Match the pairs
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isGameWon && (
            <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Level {level} Complete! 🎉</h2>
              <p className="text-green-600 dark:text-green-300">
                Completed in {formatTime(config.timer - timeLeft)} • Advancing to Level {level + 1}...
              </p>
              <div className="mt-3">
                <SocialShare
                  shareData={{
                    level,
                    timeRemaining: timeLeft,
                    totalTime: config.timer,
                    isNewHighScore,
                    gamesPlayed: highScore.totalGamesPlayed,
                  }}
                  shareType="achievement"
                  trigger={
                    <Button variant="outline" size="sm" className="bg-white/50">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Achievement
                    </Button>
                  }
                />
              </div>
            </div>
          )}

          {isGameLost && (
            <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">Game Over! ⏰</h2>
              <p className="text-red-600 dark:text-red-300">Time's up! Try again to beat Level {level}.</p>
              <div className="mt-3 flex justify-center gap-2">
                <Button onClick={() => initializeGame(level)} variant="default" size="sm">
                  Try Again
                </Button>
                <SocialShare
                  shareData={{
                    level: highScore.highestLevel,
                    gamesPlayed: highScore.totalGamesPlayed,
                  }}
                  shareType="general"
                  trigger={
                    <Button variant="outline" size="sm" className="bg-white/50">
                      <Share2 className="h-4 w-4 mr-2" />
                      Challenge Friends
                    </Button>
                  }
                />
              </div>
            </div>
          )}

          <div
            className={`grid ${gridCols} gap-2 justify-center max-w-4xl mx-auto ${shuffleComplete ? "grid-fade-in" : ""}`}
          >
            {cards.map((card, index) => (
              <FlipCard
                key={card.id}
                emoji={card.emoji}
                isRevealed={selectedCards.includes(card)}
                isMatched={card.matched}
                isWrongMatch={wrongMatchCards.includes(card.id)}
                onClick={() => handleCardClick(card)}
                disabled={!gameActive || !shuffleComplete}
                shuffleDelay={index * 100}
                isShuffling={isShuffling}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
