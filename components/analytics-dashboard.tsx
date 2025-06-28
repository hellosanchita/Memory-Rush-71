"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Globe, TrendingUp, Download, RefreshCw, Clock, Target, MapPin } from "lucide-react"
import { gameAnalytics } from "../lib/analytics"

interface AnalyticsData {
  totalSessions: number
  uniqueUsers: number
  sessionsToday: number
  averageLevel: number
  completionRate: number
  topCountries: { [country: string]: number }
  levelDistribution: { [level: number]: number }
  sessions: any[]
}

export function AnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const data = gameAnalytics.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadAnalytics()
    }
  }, [isOpen])

  const handleExportData = () => {
    const data = gameAnalytics.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memory-rush-analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTopCountries = () => {
    if (!analytics?.topCountries) return []
    return Object.entries(analytics.topCountries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  }

  const getLevelDistribution = () => {
    if (!analytics?.levelDistribution) return []
    return Object.entries(analytics.levelDistribution)
      .map(([level, count]) => ({ level: Number.parseInt(level), count }))
      .sort((a, b) => a.level - b.level)
  }

  const getRecentSessions = () => {
    if (!analytics?.sessions) return []
    return analytics.sessions.sort((a, b) => b.startTime - a.startTime).slice(0, 20)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return "In progress"
    const duration = Math.round((endTime - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!analytics && !isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-6 w-6" />
            Game Analytics Dashboard
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading analytics...</span>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button onClick={loadAnalytics} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{analytics.uniqueUsers}</div>
                  <div className="text-sm text-muted-foreground">Unique Users</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{analytics.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">{analytics.sessionsToday}</div>
                  <div className="text-sm text-muted-foreground">Today's Sessions</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="geography">Geography</TabsTrigger>
                <TabsTrigger value="levels">Levels</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Average Level Reached:</span>
                        <Badge variant="secondary">{analytics.averageLevel.toFixed(1)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <Badge variant={analytics.completionRate > 50 ? "default" : "secondary"}>
                          {analytics.completionRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Playtime:</span>
                        <Badge variant="outline">
                          {Math.round(
                            analytics.sessions.reduce((sum, s) => {
                              const duration = s.endTime ? s.endTime - s.startTime : 0
                              return sum + duration
                            }, 0) /
                              1000 /
                              60,
                          )}{" "}
                          minutes
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Sessions per User:</span>
                        <Badge variant="secondary">
                          {(analytics.totalSessions / Math.max(analytics.uniqueUsers, 1)).toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Return Rate:</span>
                        <Badge variant="outline">
                          {analytics.uniqueUsers > 0
                            ? (
                                ((analytics.totalSessions - analytics.uniqueUsers) / analytics.uniqueUsers) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="geography" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Top Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getTopCountries().map(([country, count], index) => (
                        <div key={country} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-8 text-center">
                              {index + 1}
                            </Badge>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{country}</span>
                          </div>
                          <Badge variant="secondary">{count} sessions</Badge>
                        </div>
                      ))}
                      {getTopCountries().length === 0 && (
                        <div className="text-center text-muted-foreground py-4">No geographic data available yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="levels" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Level Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getLevelDistribution().map(({ level, count }) => (
                        <div key={level} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span>Level {level}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...getLevelDistribution().map((l) => l.count))) * 100}%`,
                                }}
                              />
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getRecentSessions().map((session, index) => (
                        <div
                          key={session.sessionId}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 text-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <div className="font-medium">Level {session.level}</div>
                              <div className="text-muted-foreground text-xs">{formatDate(session.startTime)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={session.completed ? "default" : "secondary"}>
                              {session.completed ? "Completed" : "Failed"}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatDuration(session.startTime, session.endTime)}
                            </span>
                            {session.location?.country && (
                              <Badge variant="outline" className="text-xs">
                                {session.location.country}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {getRecentSessions().length === 0 && (
                        <div className="text-center text-muted-foreground py-4">No sessions recorded yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">No analytics data available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
