"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Lock, HelpCircle, X } from "lucide-react"

export function SoloGame() {
  const [showHelp, setShowHelp] = useState(false)
  const [lockedChannels, setLockedChannels] = useState({ r: false, g: false, b: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Exit to Lobby
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-purple-200 font-mono text-sm">Round 3/8</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(!showHelp)}
              className="text-purple-300 hover:text-purple-100"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr,1fr,300px] gap-6">
        {/* Target Swatch */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-purple-100">Target Color</h2>
              <div className="text-sm text-purple-300 font-mono">Time: 45s</div>
            </div>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 shadow-2xl shadow-rose-500/50 border-4 border-white/10"></div>
            <div className="text-center text-purple-300 text-sm">Match this color as closely as possible</div>
          </div>
        </Card>

        {/* Your Match */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-purple-100">Your Match</h2>
              <div className="text-sm font-mono text-purple-300">RGB(128, 64, 200)</div>
            </div>

            {/* Preview Swatch */}
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl shadow-purple-500/50 border-4 border-white/10 relative overflow-hidden">
              {/* Score Delta Floating Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl font-bold text-white/90 animate-pulse">+850</div>
              </div>
            </div>

            {/* RGB Sliders */}
            <div className="space-y-4">
              {/* Red Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <span className="font-mono">R</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setLockedChannels({ ...lockedChannels, r: !lockedChannels.r })}
                    >
                      <Lock className={`h-3 w-3 ${lockedChannels.r ? "text-red-400" : "text-slate-500"}`} />
                    </Button>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/20">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value="128"
                      className="w-16 h-8 text-center bg-slate-800/50 border-red-500/30 text-red-300 font-mono text-sm"
                      min="0"
                      max="255"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/20">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  defaultValue={[128]}
                  max={255}
                  className="[&_[role=slider]]:bg-red-500 [&_[role=slider]]:border-red-400"
                />
              </div>

              {/* Green Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <span className="font-mono">G</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setLockedChannels({ ...lockedChannels, g: !lockedChannels.g })}
                    >
                      <Lock className={`h-3 w-3 ${lockedChannels.g ? "text-green-400" : "text-slate-500"}`} />
                    </Button>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-400 hover:bg-green-500/20">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value="64"
                      className="w-16 h-8 text-center bg-slate-800/50 border-green-500/30 text-green-300 font-mono text-sm"
                      min="0"
                      max="255"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-400 hover:bg-green-500/20">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  defaultValue={[64]}
                  max={255}
                  className="[&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-400"
                />
              </div>

              {/* Blue Channel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <span className="font-mono">G</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setLockedChannels({ ...lockedChannels, b: !lockedChannels.b })}
                    >
                      <Lock className={`h-3 w-3 ${lockedChannels.b ? "text-blue-400" : "text-slate-500"}`} />
                    </Button>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400 hover:bg-blue-500/20">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value="200"
                      className="w-16 h-8 text-center bg-slate-800/50 border-blue-500/30 text-blue-300 font-mono text-sm"
                      min="0"
                      max="255"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400 hover:bg-blue-500/20">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  defaultValue={[200]}
                  max={255}
                  className="[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400"
                />
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-6 text-lg shadow-lg shadow-purple-500/50">
              Submit Match
            </Button>
          </div>
        </Card>

        {/* Live Solo Race Sidebar */}
        <div className="space-y-4">
          <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-4">
            <h3 className="text-sm font-bold text-purple-100 mb-4">Live Solo Race</h3>
            <div className="space-y-3">
              {[
                { name: "You", score: 2450, position: 3, flag: "🇺🇸", current: true },
                { name: "ColorMaster", score: 2680, position: 1, flag: "🇯🇵" },
                { name: "RGBKing", score: 2590, position: 2, flag: "🇩🇪" },
                { name: "PixelPro", score: 2340, position: 4, flag: "🇬🇧" },
                { name: "HueHunter", score: 2210, position: 5, flag: "🇫🇷" },
              ].map((player, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 ${player.current ? "bg-purple-500/20 p-2 rounded-lg border border-purple-500/40" : ""}`}
                >
                  <div className="text-xs font-mono text-purple-300 w-6">#{player.position}</div>
                  <div className="text-lg">{player.flag}</div>
                  <div className="flex-1">
                    <div className={`text-xs font-semibold ${player.current ? "text-purple-100" : "text-purple-300"}`}>
                      {player.name}
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${(player.score / 3000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-purple-300">{player.score}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="max-w-7xl mx-auto mt-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-purple-300">Session Progress</div>
            <div className="text-2xl font-bold font-mono text-purple-100">Score: 2,450</div>
          </div>
          <div className="space-y-2">
            <Progress value={37.5} className="h-3 bg-slate-800" />
            <div className="flex justify-between text-xs text-purple-300">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-8 h-2 bg-green-500 rounded-full"></div>
                ))}
                {[4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="w-8 h-2 bg-slate-700 rounded-full"></div>
                ))}
              </div>
              <div>Avg Accuracy: 85.3%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-purple-500/30 p-6 max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-purple-300"
            >
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-bold text-purple-100 mb-4">Scoring Formula</h3>
            <div className="space-y-4 text-purple-200 text-sm">
              <p>Your score is calculated using Euclidean distance in RGB space:</p>
              <div className="bg-slate-800/50 p-3 rounded-lg font-mono text-xs">score = max(0, 1000 - distance)</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-400">Excellent:</span> 900-1000
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-400">Good:</span> 700-899
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-yellow-400">Fair:</span> 400-699
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-400">Poor:</span> 0-399
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
