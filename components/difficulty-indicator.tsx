"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Grid3X3, Target, Zap } from "lucide-react"

interface DifficultyIndicatorProps {
  level: number
  gridSize: number
  pairs: number
  timer: number
  className?: string
}

export function DifficultyIndicator({ level, gridSize, pairs, timer, className = "" }: DifficultyIndicatorProps) {
  // Determine difficulty level based on level number
  const getDifficultyLevel = () => {
    if (level === 1)
      return {
        name: "Beginner",
        color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        icon: "🌱",
      }
    if (level === 2)
      return { name: "Easy", color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200", icon: "🎯" }
    if (level === 3)
      return {
        name: "Medium",
        color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
        icon: "⚡",
      }
    if (level === 4)
      return {
        name: "Hard",
        color: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
        icon: "🔥",
      }
    return { name: "Expert", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200", icon: "💀" }
  }

  // Get changes from previous level
  const getChangesFromPrevious = () => {
    const changes = []

    // Grid size changes
    if (level === 3) {
      changes.push({
        type: "grid",
        text: "Larger Grid",
        icon: <Grid3X3 className="h-3 w-3" />,
        color: "text-purple-600",
      })
    }

    // More pairs
    if (level === 2) {
      changes.push({ type: "pairs", text: "+4 Pairs", icon: <Target className="h-3 w-3" />, color: "text-blue-600" })
    } else if (level === 3) {
      changes.push({ type: "pairs", text: "+6 Pairs", icon: <Target className="h-3 w-3" />, color: "text-blue-600" })
    } else if (level === 4) {
      changes.push({ type: "pairs", text: "+6 Pairs", icon: <Target className="h-3 w-3" />, color: "text-blue-600" })
    } else if (level === 5) {
      changes.push({ type: "pairs", text: "+6 Pairs", icon: <Target className="h-3 w-3" />, color: "text-blue-600" })
    }

    // Less time
    if (level >= 2) {
      const timeReduction = level === 2 ? 10 : level === 3 ? 5 : level === 4 ? 5 : 5
      changes.push({
        type: "time",
        text: `-${timeReduction}s`,
        icon: <Clock className="h-3 w-3" />,
        color: "text-red-600",
      })
    }

    return changes
  }

  const difficulty = getDifficultyLevel()
  const changes = getChangesFromPrevious()

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Difficulty Level Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{difficulty.icon}</span>
              <Badge className={`${difficulty.color} border-0 font-semibold`}>
                Level {level} - {difficulty.name}
              </Badge>
            </div>
            {level > 1 && (
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Difficulty ↑
              </Badge>
            )}
          </div>

          {/* Current Level Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">
                {gridSize}×{gridSize}
              </span>
              <span className="text-xs text-muted-foreground">Grid</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">{pairs}</span>
              <span className="text-xs text-muted-foreground">Pairs</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">{timer}s</span>
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
          </div>

          {/* Changes from Previous Level */}
          {changes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">What's New:</div>
              <div className="flex flex-wrap gap-1">
                {changes.map((change, index) => (
                  <Badge key={index} variant="outline" className={`text-xs ${change.color} border-current`}>
                    {change.icon}
                    <span className="ml-1">{change.text}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Level-specific tips */}
          {level === 1 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <strong>Tip:</strong> Take your time to learn the card positions. You have plenty of time!
            </div>
          )}
          {level === 2 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <strong>Tip:</strong> More pairs to find, but same grid size. Focus on memorizing patterns!
            </div>
          )}
          {level === 3 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <strong>Tip:</strong> Bigger grid means more spatial memory needed. Group cards mentally!
            </div>
          )}
          {level === 4 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <strong>Tip:</strong> Almost full grid with tight timing. Stay calm and focused!
            </div>
          )}
          {level >= 5 && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <strong>Tip:</strong> Maximum challenge! Every card matters. Trust your memory!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
