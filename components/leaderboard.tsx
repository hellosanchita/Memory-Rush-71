"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLeaderboard } from "../hooks/use-leaderboard"
import { Trophy, Medal, Award, Share2, User, Clock, Target, Gamepad2, RefreshCw } from "lucide-react"
import { SocialShare } from "./social-share"

interface LeaderboardProps {
  currentHighScore: {
    highestLevel: number
    levelTimes: { [level: number]: number }
    totalGamesPlayed: number
  }
}

export function Leaderboard({ currentHighScore }: LeaderboardProps) {
  const {
    leaderboard,
    playerName,
    setPlayerName,
    isLoading,
    playerEntry,
    loadLeaderboard,
    submitScore,
    getPlayerRank,
    shareLeaderboard,
  } = useLeaderboard()

  const [isOpen, setIsOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
    }
  }, [isOpen, loadLeaderboard])

  const handleSubmitScore = async () => {
    const success = await submitScore(
      currentHighScore.highestLevel,
      currentHighScore.levelTimes,
      currentHighScore.totalGamesPlayed,
    )
    if (success) {
      setShareMessage("Score submitted successfully! 🎉")
      setTimeout(() => setShareMessage(""), 3000)
    }
  }

  const handleShare = async () => {
    const result = await shareLeaderboard()
    if (result === "copied") {
      setShareMessage("Leaderboard link copied to clipboard! 📋")
      setTimeout(() => setShareMessage(""), 3000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getTopPlayersByCategory = (category: "level" | "speed" | "games") => {
    const sorted = [...leaderboard]
    switch (category) {
      case "level":
        return sorted.sort((a, b) => b.highestLevel - a.highestLevel).slice(0, 10)
      case "speed":
        return sorted
          .sort((a, b) => {
            const aAvgTime =
              Object.values(a.bestTimes).reduce((sum, time) => sum + time, 0) / Object.keys(a.bestTimes).length
            const bAvgTime =
              Object.values(b.bestTimes).reduce((sum, time) => sum + time, 0) / Object.keys(b.bestTimes).length
            return aAvgTime - bAvgTime
          })
          .slice(0, 10)
      case "games":
        return sorted.sort((a, b) => b.gamesPlayed - a.gamesPlayed).slice(0, 10)
      default:
        return sorted.slice(0, 10)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Memory Rush Leaderboard
          </DialogTitle>
        </DialogHeader>

        {shareMessage && (
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg text-green-800 dark:text-green-200 text-center">
            {shareMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Player Submission Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Your Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Player Name</label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={20}
                  />
                </div>
                <Button
                  onClick={handleSubmitScore}
                  disabled={!playerName.trim() || isLoading}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Submit Score
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-lg">{currentHighScore.highestLevel}</div>
                  <div className="text-muted-foreground">Highest Level</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-lg">{Object.keys(currentHighScore.levelTimes).length}</div>
                  <div className="text-muted-foreground">Levels Completed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-bold text-lg">{currentHighScore.totalGamesPlayed}</div>
                  <div className="text-muted-foreground">Games Played</div>
                </div>
              </div>

              {playerEntry && (
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Your Rank: #{getPlayerRank()}</span>
                    <div className="flex gap-2">
                      <Button onClick={handleShare} variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <SocialShare
                        shareData={{
                          level: playerEntry.highestLevel,
                          leaderboardRank: getPlayerRank(),
                          gamesPlayed: playerEntry.gamesPlayed,
                        }}
                        shareType="leaderboard"
                        trigger={
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Social
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard Tabs */}
          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="level">By Level</TabsTrigger>
              <TabsTrigger value="speed">By Speed</TabsTrigger>
              <TabsTrigger value="games">By Games</TabsTrigger>
            </TabsList>

            <TabsContent value="overall" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Top Players</h3>
                <div className="flex gap-2">
                  <Button onClick={loadLeaderboard} variant="ghost" size="sm" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <SocialShare
                    shareData={{
                      level: currentHighScore.highestLevel,
                      gamesPlayed: currentHighScore.totalGamesPlayed,
                    }}
                    shareType="general"
                    trigger={
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Game
                      </Button>
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <Card key={entry.id} className={`${playerEntry?.id === entry.id ? "ring-2 ring-blue-500" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <span className="text-2xl">{entry.avatar}</span>
                          <div>
                            <div className="font-semibold">{entry.playerName}</div>
                            <div className="text-sm text-muted-foreground">
                              Level {entry.highestLevel} • {entry.gamesPlayed} games
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{entry.totalScore}</div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="level" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Highest Level Reached
              </h3>
              <div className="space-y-2">
                {getTopPlayersByCategory("level").map((entry, index) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <span className="text-2xl">{entry.avatar}</span>
                          <span className="font-semibold">{entry.playerName}</span>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          Level {entry.highestLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="speed" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Fastest Average Times
              </h3>
              <div className="space-y-2">
                {getTopPlayersByCategory("speed").map((entry, index) => {
                  const avgTime =
                    Object.values(entry.bestTimes).reduce((sum, time) => sum + time, 0) /
                    Object.keys(entry.bestTimes).length
                  return (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getRankIcon(index + 1)}
                            <span className="text-2xl">{entry.avatar}</span>
                            <span className="font-semibold">{entry.playerName}</span>
                          </div>
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {formatTime(Math.round(avgTime))} avg
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="games" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Most Games Played
              </h3>
              <div className="space-y-2">
                {getTopPlayersByCategory("games").map((entry, index) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <span className="text-2xl">{entry.avatar}</span>
                          <span className="font-semibold">{entry.playerName}</span>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {entry.gamesPlayed} games
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
