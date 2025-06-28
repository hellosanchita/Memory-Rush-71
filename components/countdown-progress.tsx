"use client"

interface CountdownProgressProps {
  timeLeft: number
  totalTime: number
  className?: string
}

export function CountdownProgress({ timeLeft, totalTime, className = "" }: CountdownProgressProps) {
  const percentage = (timeLeft / totalTime) * 100

  // Determine color based on remaining time percentage
  const getProgressColor = () => {
    if (percentage > 60) return "bg-green-500"
    if (percentage > 30) return "bg-yellow-500"
    if (percentage > 15) return "bg-orange-500"
    return "bg-red-500"
  }

  const getProgressBarClass = () => {
    let baseClass = "transition-all duration-1000 ease-linear"

    // Add pulsing animation when time is very low
    if (percentage <= 15) {
      baseClass += " animate-pulse"
    }

    return baseClass
  }

  const getContainerClass = () => {
    let baseClass = "relative overflow-hidden rounded-full"

    // Add subtle shake when time is critically low
    if (percentage <= 10) {
      baseClass += " animate-pulse"
    }

    return baseClass
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={getContainerClass()}>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${getProgressColor()} ${getProgressBarClass()}`}
            style={{ width: `${Math.max(0, percentage)}%` }}
          />
        </div>

        {/* Time remaining overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xs font-bold ${
              percentage <= 15 ? "text-white drop-shadow-lg" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Warning indicators */}
      {percentage <= 15 && (
        <div className="flex justify-center mt-1">
          <span className="text-xs text-red-500 font-bold animate-pulse">⚠️ TIME RUNNING OUT!</span>
        </div>
      )}
    </div>
  )
}
