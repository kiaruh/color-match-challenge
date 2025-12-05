"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

const mockLeaderboard = [
  { rank: 1, name: "ColorMaster", score: 7842, country: "🇺🇸", change: "up" },
  { rank: 2, name: "RGBWizard", score: 7791, country: "🇬🇧", change: "up" },
  { rank: 3, name: "HueHunter", score: 7654, country: "🇨🇦", change: "down" },
  { rank: 4, name: "ChromaKing", score: 7543, country: "🇩🇪", change: "same" },
  { rank: 5, name: "PixelPerfect", score: 7432, country: "🇯🇵", change: "up" },
  { rank: 6, name: "ShadeShifter", score: 7321, country: "🇫🇷", change: "up" },
  { rank: 7, name: "TintTamer", score: 7234, country: "🇦🇺", change: "down" },
  { rank: 8, name: "Player_7291", score: 7127, country: "🇺🇸", change: "up", isYou: true },
]

export function Leaderboard() {
  const [tab, setTab] = useState<"global" | "country">("global")

  return (
    <Card className="glass p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Leaderboard
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "global" ? "default" : "ghost"} onClick={() => setTab("global")}>
            Global
          </Button>
          <Button size="sm" variant={tab === "country" ? "default" : "ghost"} onClick={() => setTab("country")}>
            Country
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {mockLeaderboard.map((player) => (
          <div
            key={player.rank}
            className={`glass p-4 rounded-lg border transition-all ${
              player.isYou ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-primary/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 text-center">
                {player.rank <= 3 ? (
                  <div
                    className={`text-2xl font-bold ${
                      player.rank === 1 ? "text-yellow-500" : player.rank === 2 ? "text-gray-400" : "text-amber-700"
                    }`}
                  >
                    {player.rank}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-muted-foreground">{player.rank}</div>
                )}
              </div>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-2xl">{player.country}</span>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {player.name}
                    {player.isYou && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Score: {player.score.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {player.change === "up" && <TrendingUp className="w-5 h-5 text-green-500" />}
                {player.change === "down" && <TrendingDown className="w-5 h-5 text-red-500" />}
                {player.change === "same" && <Minus className="w-5 h-5 text-muted-foreground" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Leaderboard resets weekly. Next reset in 23:42:16
      </div>
    </Card>
  )
}
