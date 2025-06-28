"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Link, Copy, Trophy, Target, Clock } from "lucide-react"

interface SocialShareProps {
  trigger?: React.ReactNode
  shareData: {
    level?: number
    score?: number
    timeRemaining?: number
    totalTime?: number
    isNewHighScore?: boolean
    gamesPlayed?: number
    leaderboardRank?: number
  }
  shareType?: "achievement" | "highscore" | "general" | "leaderboard"
}

export function SocialShare({ trigger, shareData, shareType = "general" }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const gameUrl = typeof window !== "undefined" ? window.location.href : "https://memory-rush.game"
  const gameTitle = "Memory Rush"

  const generateShareMessage = () => {
    const { level, score, timeRemaining, totalTime, isNewHighScore, gamesPlayed, leaderboardRank } = shareData

    switch (shareType) {
      case "achievement":
        if (level && timeRemaining !== undefined && totalTime) {
          const timeTaken = totalTime - timeRemaining
          const minutes = Math.floor(timeTaken / 60)
          const seconds = timeTaken % 60
          const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`
          return `🎉 Just completed Level ${level} in Memory Rush in ${timeStr}! Can you beat my time? 🧠⚡`
        }
        return `🎮 Just crushed another level in Memory Rush! Think you can keep up? 🚀`

      case "highscore":
        if (isNewHighScore && level) {
          return `🏆 NEW HIGH SCORE! Just reached Level ${level} in Memory Rush! 🎯 Beat the clock and challenge your memory! 🧠💨`
        }
        return `🎯 Just set a new personal best in Memory Rush! Can you match pairs faster than me? ⚡🧠`

      case "leaderboard":
        if (leaderboardRank && level) {
          return `📊 Ranked #${leaderboardRank} on the Memory Rush leaderboard! Level ${level} reached 🏆 Think you can climb higher? 🚀`
        }
        return `🏆 Check out my Memory Rush leaderboard position! Can you beat my score? 🎯`

      default:
        return `🧠 Challenge your memory with Memory Rush! Match emoji pairs before time runs out ⏰ How far can you go? 🚀`
    }
  }

  const shareMessage = generateShareMessage()
  const fullShareText = `${shareMessage}\n\nPlay now: ${gameUrl}`

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(gameUrl)}&hashtags=MemoryRush,BrainGame,Challenge`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodeURIComponent(shareMessage)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(gameUrl)}&summary=${encodeURIComponent(shareMessage)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(fullShareText)}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.log("Failed to copy:", error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: gameTitle,
          text: shareMessage,
          url: gameUrl,
        })
      } catch (error) {
        console.log("Share failed:", error)
      }
    }
  }

  const openShareUrl = (url: string) => {
    window.open(url, "_blank", "width=600,height=400,scrollbars=yes,resizable=yes")
  }

  const getShareIcon = () => {
    switch (shareType) {
      case "achievement":
        return <Target className="h-4 w-4" />
      case "highscore":
        return <Trophy className="h-4 w-4" />
      case "leaderboard":
        return <Trophy className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  const getShareTitle = () => {
    switch (shareType) {
      case "achievement":
        return "Share Achievement"
      case "highscore":
        return "Share High Score"
      case "leaderboard":
        return "Share Leaderboard Position"
      default:
        return "Share Memory Rush"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            {getShareIcon()}
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {getShareTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Preview */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <span className="font-semibold">{gameTitle}</span>
                </div>
                <p className="text-sm text-muted-foreground">{shareMessage}</p>

                {/* Achievement Details */}
                {shareData.level && (
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      Level {shareData.level}
                    </Badge>
                    {shareData.timeRemaining !== undefined && shareData.totalTime && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor((shareData.totalTime - shareData.timeRemaining) / 60)}:
                        {((shareData.totalTime - shareData.timeRemaining) % 60).toString().padStart(2, "0")}
                      </Badge>
                    )}
                    {shareData.isNewHighScore && (
                      <Badge variant="default" className="text-xs">
                        🏆 New High Score!
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Share on social media:</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => openShareUrl(shareUrls.twitter)}
                variant="outline"
                className="flex items-center gap-2 justify-start"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
                Twitter
              </Button>
              <Button
                onClick={() => openShareUrl(shareUrls.facebook)}
                variant="outline"
                className="flex items-center gap-2 justify-start"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                onClick={() => openShareUrl(shareUrls.linkedin)}
                variant="outline"
                className="flex items-center gap-2 justify-start"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                onClick={() => openShareUrl(shareUrls.whatsapp)}
                variant="outline"
                className="flex items-center gap-2 justify-start"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Native Share & Copy */}
          <div className="space-y-2">
            {navigator.share && (
              <Button onClick={handleNativeShare} variant="outline" className="w-full bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share via device
              </Button>
            )}
            <Button onClick={handleCopyLink} variant="outline" className="w-full bg-transparent" disabled={copySuccess}>
              {copySuccess ? (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Copy link
                </>
              )}
            </Button>
          </div>

          {/* Game Stats Summary */}
          {(shareData.gamesPlayed || shareData.leaderboardRank) && (
            <Card className="bg-primary/5">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-medium">Your Memory Rush Stats:</div>
                  {shareData.gamesPlayed && <div>🎮 Games played: {shareData.gamesPlayed}</div>}
                  {shareData.leaderboardRank && <div>🏆 Leaderboard rank: #{shareData.leaderboardRank}</div>}
                  {shareData.level && <div>🎯 Highest level: {shareData.level}</div>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
