"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Clock, TrendingUp } from "lucide-react"

export function LiveActivities() {
  return (
    <div className="space-y-4">
      <Card className="glass p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Live Games
        </h3>
        <div className="space-y-3">
          <div className="glass p-3 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">ColorMaster vs 3 others</span>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Round 5/8</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                Spectate
              </Button>
            </div>
          </div>
          <div className="glass p-3 rounded-lg border border-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">RainbowKid vs FastFingers</span>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Round 2/8</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs">
                Spectate
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Last Session
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className="text-sm font-bold text-primary">7,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Accuracy</span>
            <span className="text-sm font-bold text-secondary">91.2%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rank</span>
            <span className="text-sm font-bold text-accent">#127</span>
          </div>
        </div>
      </Card>

      <Card className="glass p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Weekly Reset
        </h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent mb-1">23:42:16</div>
          <p className="text-xs text-muted-foreground">Climb the leaderboard before time runs out!</p>
        </div>
      </Card>
    </div>
  )
}
