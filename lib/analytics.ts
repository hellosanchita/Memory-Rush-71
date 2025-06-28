"use client"

interface GameSession {
  sessionId: string
  userId: string
  startTime: number
  endTime?: number
  level: number
  completed: boolean
  timeRemaining?: number
  totalTime: number
  location?: {
    country?: string
    region?: string
    city?: string
    timezone?: string
  }
  userAgent?: string
  screenSize?: string
}

interface AnalyticsData {
  totalSessions: number
  uniqueUsers: number
  sessionsToday: number
  averageLevel: number
  completionRate: number
  topCountries: { [country: string]: number }
  levelDistribution: { [level: number]: number }
  sessions: GameSession[]
}

class GameAnalytics {
  private storageKey = "memoryRushAnalytics"
  private userIdKey = "memoryRushUserId"
  private sessionIdKey = "memoryRushSessionId"

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private getUserId(): string {
    if (typeof window === "undefined") return ""

    let userId = localStorage.getItem(this.userIdKey)
    if (!userId) {
      userId = this.generateId()
      localStorage.setItem(this.userIdKey, userId)
    }
    return userId
  }

  private getSessionId(): string {
    if (typeof window === "undefined") return ""

    let sessionId = sessionStorage.getItem(this.sessionIdKey)
    if (!sessionId) {
      sessionId = this.generateId()
      sessionStorage.setItem(this.sessionIdKey, sessionId)
    }
    return sessionId
  }

  private async getLocationData(): Promise<any> {
    try {
      // Use a free IP geolocation service
      const response = await fetch("https://ipapi.co/json/")
      if (response.ok) {
        const data = await response.json()
        return {
          country: data.country_name,
          region: data.region,
          city: data.city,
          timezone: data.timezone,
        }
      }
    } catch (error) {
      console.log("Could not fetch location data:", error)
    }

    // Fallback to timezone detection
    try {
      return {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    } catch (error) {
      return {}
    }
  }

  private getAnalyticsData(): AnalyticsData {
    if (typeof window === "undefined") {
      return {
        totalSessions: 0,
        uniqueUsers: 0,
        sessionsToday: 0,
        averageLevel: 0,
        completionRate: 0,
        topCountries: {},
        levelDistribution: {},
        sessions: [],
      }
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.log("Error loading analytics data:", error)
    }

    return {
      totalSessions: 0,
      uniqueUsers: 0,
      sessionsToday: 0,
      averageLevel: 0,
      completionRate: 0,
      topCountries: {},
      levelDistribution: {},
      sessions: [],
    }
  }

  private saveAnalyticsData(data: AnalyticsData): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.log("Error saving analytics data:", error)
    }
  }

  private updateAggregatedStats(data: AnalyticsData): void {
    const now = new Date()
    const today = now.toDateString()

    // Calculate unique users
    const uniqueUserIds = new Set(data.sessions.map((s) => s.userId))
    data.uniqueUsers = uniqueUserIds.size

    // Calculate sessions today
    data.sessionsToday = data.sessions.filter((s) => new Date(s.startTime).toDateString() === today).length

    // Calculate average level
    const completedSessions = data.sessions.filter((s) => s.completed)
    data.averageLevel =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + s.level, 0) / completedSessions.length
        : 0

    // Calculate completion rate
    data.completionRate = data.totalSessions > 0 ? (completedSessions.length / data.totalSessions) * 100 : 0

    // Calculate top countries
    data.topCountries = {}
    data.sessions.forEach((session) => {
      if (session.location?.country) {
        data.topCountries[session.location.country] = (data.topCountries[session.location.country] || 0) + 1
      }
    })

    // Calculate level distribution
    data.levelDistribution = {}
    data.sessions.forEach((session) => {
      data.levelDistribution[session.level] = (data.levelDistribution[session.level] || 0) + 1
    })
  }

  async startSession(level = 1): Promise<void> {
    const userId = this.getUserId()
    const sessionId = this.getSessionId()
    const location = await this.getLocationData()

    const session: GameSession = {
      sessionId,
      userId,
      startTime: Date.now(),
      level,
      completed: false,
      totalTime: 60, // Default, will be updated
      location,
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
    }

    const data = this.getAnalyticsData()

    // Remove any existing session with same sessionId
    data.sessions = data.sessions.filter((s) => s.sessionId !== sessionId)

    // Add new session
    data.sessions.push(session)
    data.totalSessions = data.sessions.length

    this.updateAggregatedStats(data)
    this.saveAnalyticsData(data)
  }

  completeSession(level: number, timeRemaining: number, totalTime: number): void {
    const sessionId = this.getSessionId()
    const data = this.getAnalyticsData()

    const sessionIndex = data.sessions.findIndex((s) => s.sessionId === sessionId)
    if (sessionIndex >= 0) {
      data.sessions[sessionIndex] = {
        ...data.sessions[sessionIndex],
        endTime: Date.now(),
        level,
        completed: true,
        timeRemaining,
        totalTime,
      }

      this.updateAggregatedStats(data)
      this.saveAnalyticsData(data)
    }
  }

  gameOver(level: number, totalTime: number): void {
    const sessionId = this.getSessionId()
    const data = this.getAnalyticsData()

    const sessionIndex = data.sessions.findIndex((s) => s.sessionId === sessionId)
    if (sessionIndex >= 0) {
      data.sessions[sessionIndex] = {
        ...data.sessions[sessionIndex],
        endTime: Date.now(),
        level,
        completed: false,
        timeRemaining: 0,
        totalTime,
      }

      this.updateAggregatedStats(data)
      this.saveAnalyticsData(data)
    }
  }

  getAnalytics(): AnalyticsData {
    const data = this.getAnalyticsData()
    this.updateAggregatedStats(data)
    return data
  }

  // Clean up old sessions (keep last 1000 sessions)
  cleanupOldSessions(): void {
    const data = this.getAnalyticsData()
    if (data.sessions.length > 1000) {
      data.sessions = data.sessions.sort((a, b) => b.startTime - a.startTime).slice(0, 1000)

      data.totalSessions = data.sessions.length
      this.updateAggregatedStats(data)
      this.saveAnalyticsData(data)
    }
  }

  // Export analytics data
  exportData(): string {
    const data = this.getAnalyticsData()
    return JSON.stringify(data, null, 2)
  }

  // Reset all analytics data
  resetAnalytics(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey)
      sessionStorage.removeItem(this.sessionIdKey)
    }
  }
}

export const gameAnalytics = new GameAnalytics()
