"use client"

interface MemoryRushLogoProps {
  size?: number
  className?: string
}

export function MemoryRushLogo({ size = 48, className = "" }: MemoryRushLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main background circle */}
        <circle cx="32" cy="32" r="30" fill="url(#bgGradient)" filter="url(#glow)" />

        {/* Memory cards arranged in a pattern */}
        <g transform="translate(16, 16)">
          {/* Card 1 - Top left */}
          <rect x="0" y="0" width="12" height="12" rx="2" fill="url(#cardGradient)" opacity="0.9" />
          <text x="6" y="9" textAnchor="middle" fontSize="8" fill="white">
            🧠
          </text>

          {/* Card 2 - Top right */}
          <rect x="20" y="0" width="12" height="12" rx="2" fill="url(#cardGradient)" opacity="0.8" />
          <text x="26" y="9" textAnchor="middle" fontSize="8" fill="white">
            ⚡
          </text>

          {/* Card 3 - Bottom left */}
          <rect x="0" y="20" width="12" height="12" rx="2" fill="url(#cardGradient)" opacity="0.7" />
          <text x="6" y="29" textAnchor="middle" fontSize="8" fill="white">
            🎯
          </text>

          {/* Card 4 - Bottom right */}
          <rect x="20" y="20" width="12" height="12" rx="2" fill="url(#cardGradient)" opacity="0.9" />
          <text x="26" y="29" textAnchor="middle" fontSize="8" fill="white">
            🚀
          </text>
        </g>

        {/* Speed lines for "Rush" effect */}
        <g opacity="0.6">
          <path d="M8 20 L16 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 24 L14 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 28 L12 28" stroke="white" strokeWidth="2" strokeLinecap="round" />

          <path d="M48 36 L56 36" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 40 L56 40" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M52 44 L56 44" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Clock element for time pressure */}
        <circle cx="48" cy="16" r="8" fill="white" opacity="0.9" />
        <circle cx="48" cy="16" r="6" fill="none" stroke="#3b82f6" strokeWidth="1" />
        <path d="M48 12 L48 16 L51 19" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Memory Rush
        </span>
        <span className="text-xs text-muted-foreground -mt-1">Beat the Clock!</span>
      </div>
    </div>
  )
}
