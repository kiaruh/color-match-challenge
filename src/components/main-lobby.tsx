"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Trophy, BarChart3, MessageSquare, Plus, Wifi } from "lucide-react"
import { CreateRoomModal } from "./create-room-modal"
import { RoomList } from "./room-list"
import { LiveActivities } from "./live-activities"
import { Leaderboard } from "./leaderboard"

export function MainLobby() {
  const [activeTab, setActiveTab] = useState<"lobby" | "rankings" | "stats">("lobby")
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold neon-text">Color Match Challenge</h1>
            </div>

            <nav className="flex items-center gap-6">
              <Button
                variant={activeTab === "lobby" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("lobby")}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Game Modes
              </Button>
              <Button
                variant={activeTab === "rankings" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("rankings")}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Rankings
              </Button>
              <Button
                variant={activeTab === "stats" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("stats")}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Stats
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2">
                <Wifi
                  className={`w-3 h-3 ${connectionStatus === "connected" ? "text-green-500" : "text-yellow-500"}`}
                />
                {connectionStatus === "connected" ? "Connected" : "Connecting"}
              </Badge>
              <Badge variant="secondary">Player_7291</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {activeTab === "lobby" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Card */}
              <Card className="glass neon-glow p-8 border-primary/30">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold mb-2 neon-text">Welcome to Color Match Challenge</h2>
                    <p className="text-muted-foreground text-lg">
                      A multiplayer color-perception game. Use RGB sliders to match colors in real-time, compete with
                      players worldwide, and climb the leaderboards.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg" className="gap-2 neon-glow">
                      <Play className="w-5 h-5" />
                      Solo Challenge
                    </Button>
                    <Button size="lg" variant="secondary" className="gap-2" onClick={() => setShowCreateRoom(true)}>
                      <Plus className="w-5 h-5" />
                      Create Room
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 pt-4">
                    <div className="glass p-4 rounded-lg border border-primary/20">
                      <div className="text-2xl font-bold text-primary mb-1">8</div>
                      <div className="text-sm text-muted-foreground">Rounds per session</div>
                    </div>
                    <div className="glass p-4 rounded-lg border border-secondary/20">
                      <div className="text-2xl font-bold text-secondary mb-1">1000</div>
                      <div className="text-sm text-muted-foreground">Max score per round</div>
                    </div>
                    <div className="glass p-4 rounded-lg border border-accent/20">
                      <div className="text-2xl font-bold text-accent mb-1">24h</div>
                      <div className="text-sm text-muted-foreground">Until weekly reset</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Room List */}
              <RoomList />
            </div>

            {/* Live Activities Sidebar */}
            <div className="space-y-6">
              <LiveActivities />
            </div>
          </div>
        )}

        {activeTab === "rankings" && <Leaderboard />}

        {activeTab === "stats" && (
          <Card className="glass p-8">
            <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
            <div className="space-y-4">
              <div className="glass p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Best Score</div>
                <div className="text-3xl font-bold text-primary">7,842</div>
              </div>
              <div className="glass p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Average Accuracy</div>
                <div className="text-3xl font-bold text-secondary">92.4%</div>
              </div>
              <div className="glass p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Games Played</div>
                <div className="text-3xl font-bold text-accent">156</div>
              </div>
            </div>
          </Card>
        )}
      </main>

      <CreateRoomModal open={showCreateRoom} onOpenChange={setShowCreateRoom} />
    </div>
  )
}
