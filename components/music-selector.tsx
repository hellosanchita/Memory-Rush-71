"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Music, Play, Pause, Check } from "lucide-react"
import type { BackgroundMusicType } from "../hooks/use-audio"

interface MusicSelectorProps {
  currentMusicType: BackgroundMusicType
  onMusicChange: (type: BackgroundMusicType) => void
  isMusicPlaying: boolean
  isMusicMuted: boolean
  onToggleMusic: () => void
}

const musicOptions = [
  {
    type: "ambient" as BackgroundMusicType,
    name: "Ambient Zen",
    description: "Peaceful, meditative tones for focused gameplay",
    icon: "🧘",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  },
  {
    type: "electronic" as BackgroundMusicType,
    name: "Electronic Pulse",
    description: "Modern electronic beats with bass lines",
    icon: "🎛️",
    color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  },
  {
    type: "nature" as BackgroundMusicType,
    name: "Nature Harmony",
    description: "Gentle pentatonic melodies inspired by nature",
    icon: "🌿",
    color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  },
  {
    type: "classical" as BackgroundMusicType,
    name: "Classical Grace",
    description: "Elegant chord progressions in classical style",
    icon: "🎼",
    color: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
  },
  {
    type: "upbeat" as BackgroundMusicType,
    name: "Upbeat Energy",
    description: "Energetic major chords with rhythmic elements",
    icon: "⚡",
    color: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
  },
]

export function MusicSelector({
  currentMusicType,
  onMusicChange,
  isMusicPlaying,
  isMusicMuted,
  onToggleMusic,
}: MusicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [previewType, setPreviewType] = useState<BackgroundMusicType | null>(null)

  const currentMusic = musicOptions.find((option) => option.type === currentMusicType)

  const handleMusicSelect = (type: BackgroundMusicType) => {
    onMusicChange(type)
    setPreviewType(null)
  }

  const handlePreview = (type: BackgroundMusicType) => {
    if (previewType === type) {
      setPreviewType(null)
    } else {
      setPreviewType(type)
      // In a real implementation, you might want to play a preview
      // For now, we'll just show the selection
      setTimeout(() => setPreviewType(null), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Music className="h-4 w-4" />
          <span className="hidden sm:inline">Music</span>
          <Badge variant="secondary" className="text-xs">
            {currentMusic?.icon}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Music className="h-5 w-5" />
            Background Music Selection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Music Status */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentMusic?.icon}</span>
                  <div>
                    <h3 className="font-semibold">{currentMusic?.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentMusic?.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isMusicPlaying && !isMusicMuted ? "default" : "secondary"}>
                    {isMusicPlaying && !isMusicMuted ? "Playing" : "Paused"}
                  </Badge>
                  <Button onClick={onToggleMusic} variant="ghost" size="sm">
                    {isMusicPlaying && !isMusicMuted ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Choose Your Background Music</h3>
            <div className="grid gap-3">
              {musicOptions.map((option) => (
                <Card
                  key={option.type}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentMusicType === option.type ? "ring-2 ring-primary" : ""
                  } ${previewType === option.type ? "scale-105" : ""}`}
                  onClick={() => handleMusicSelect(option.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${option.color}`}>
                          <span className="text-lg">{option.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {option.name}
                            {currentMusicType === option.type && <Check className="h-4 w-4 text-primary" />}
                          </h4>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(option.type)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          {previewType === option.type ? (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Preview
                            </>
                          )}
                        </Button>
                        {currentMusicType === option.type && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Music Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">💡 Music Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <strong>Ambient Zen:</strong> Best for concentration and long gaming sessions
                </li>
                <li>
                  • <strong>Electronic Pulse:</strong> Great for maintaining energy and focus
                </li>
                <li>
                  • <strong>Nature Harmony:</strong> Perfect for relaxation and stress-free play
                </li>
                <li>
                  • <strong>Classical Grace:</strong> Ideal for elegant, thoughtful gameplay
                </li>
                <li>
                  • <strong>Upbeat Energy:</strong> Excellent for fast-paced, competitive play
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
