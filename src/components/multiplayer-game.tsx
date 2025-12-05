"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Settings,
  Users,
  Crown,
  Send,
  Smile,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react"

export function MultiplayerGame() {
  const [lockedChannels, setLockedChannels] = useState({ r: false, g: false, b: false })
  const [chatMessage, setChatMessage] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showHostControls, setShowHostControls] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Leave Room
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-purple-100 font-bold">Pro Players Room</span>
              <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                <Users className="h-3 w-3 mr-1" />
                4/8
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-purple-200 font-mono text-sm">Round 5/10</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-purple-300 hover:text-purple-100"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHostControls(!showHostControls)}
              className="text-purple-300 hover:text-purple-100"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-[1800px] mx-auto grid lg:grid-cols-[1fr,1fr,350px] gap-6">
        {/* Left Column: Target + Your Match */}
        <div className="space-y-6">
          {/* Target Swatch */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-purple-100">Target Color</h2>
                <div className="text-sm text-purple-300 font-mono">⏱ 38s remaining</div>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 shadow-2xl shadow-teal-500/50 border-4 border-white/10"></div>
            </div>
          </Card>

          {/* Your Match */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-purple-100">Your Match</h2>
                <div className="text-sm font-mono text-purple-300">RGB(85, 180, 200)</div>
              </div>

              {/* Preview Swatch */}
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 shadow-2xl shadow-cyan-500/50 border-4 border-white/10"></div>

              {/* RGB Sliders */}
              <div className="space-y-3">
                {/* Red Channel */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-red-400 flex items-center gap-2">
                      <span className="font-mono">R</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setLockedChannels({ ...lockedChannels, r: !lockedChannels.r })}
                      >
                        <Lock className={`h-3 w-3 ${lockedChannels.r ? "text-red-400" : "text-slate-500"}`} />
                      </Button>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:bg-red-500/20">
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value="85"
                        className="w-14 h-7 text-center bg-slate-800/50 border-red-500/30 text-red-300 font-mono text-xs"
                        min="0"
                        max="255"
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:bg-red-500/20">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    defaultValue={[85]}
                    max={255}
                    className="[&_[role=slider]]:bg-red-500 [&_[role=slider]]:border-red-400"
                  />
                </div>

                {/* Green Channel */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-green-400 flex items-center gap-2">
                      <span className="font-mono">G</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setLockedChannels({ ...lockedChannels, g: !lockedChannels.g })}
                      >
                        <Lock className={`h-3 w-3 ${lockedChannels.g ? "text-green-400" : "text-slate-500"}`} />
                      </Button>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-green-400 hover:bg-green-500/20">
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value="180"
                        className="w-14 h-7 text-center bg-slate-800/50 border-green-500/30 text-green-300 font-mono text-xs"
                        min="0"
                        max="255"
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-green-400 hover:bg-green-500/20">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    defaultValue={[180]}
                    max={255}
                    className="[&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-400"
                  />
                </div>

                {/* Blue Channel */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-blue-400 flex items-center gap-2">
                      <span className="font-mono">B</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => setLockedChannels({ ...lockedChannels, b: !lockedChannels.b })}
                      >
                        <Lock className={`h-3 w-3 ${lockedChannels.b ? "text-blue-400" : "text-slate-500"}`} />
                      </Button>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-400 hover:bg-blue-500/20">
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value="200"
                        className="w-14 h-7 text-center bg-slate-800/50 border-blue-500/30 text-blue-300 font-mono text-xs"
                        min="0"
                        max="255"
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-400 hover:bg-blue-500/20">
                        <ChevronRight className="h-3 w-3" />
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

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 shadow-lg shadow-purple-500/50">
                Submit Match
              </Button>
            </div>
          </Card>
        </div>

        {/* Center Column: Live Scoreboard */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-6">
          <h2 className="text-lg font-bold text-purple-100 mb-4">Live Scoreboard</h2>
          <ScrollArea className="h-[700px]">
            <div className="space-y-3">
              {[
                { name: "ColorMaster", score: 4580, delta: "+850", rank: 1, you: false, avatar: "🎨" },
                { name: "You", score: 4350, delta: "+820", rank: 2, you: true, avatar: "👤" },
                { name: "RGBKing", score: 4120, delta: "+780", rank: 3, you: false, avatar: "👑" },
                { name: "PixelPro", score: 3890, delta: "+690", rank: 4, you: false, avatar: "🖼️" },
              ].map((player, i) => (
                <Card
                  key={i}
                  className={`p-4 ${player.you ? "bg-purple-500/20 border-purple-500/40" : "bg-slate-800/50 border-slate-700/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-2xl font-bold font-mono ${player.rank === 1 ? "text-yellow-400" : player.rank === 2 ? "text-slate-300" : player.rank === 3 ? "text-orange-400" : "text-purple-300"}`}
                    >
                      #{player.rank}
                    </div>
                    <div className="text-2xl">{player.avatar}</div>
                    <div className="flex-1">
                      <div className={`font-semibold ${player.you ? "text-purple-100" : "text-purple-200"}`}>
                        {player.name}
                      </div>
                      <div className="text-xs text-purple-400 flex items-center gap-2">
                        <span className="font-mono">{player.score} pts</span>
                        <span className="text-green-400 font-semibold">{player.delta}</span>
                      </div>
                    </div>
                    {player.rank <= 3 && (
                      <div className="text-2xl">{player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}</div>
                    )}
                  </div>

                  {/* Round History */}
                  <div className="mt-3 flex gap-1">
                    {[950, 880, 820, 780, 850].map((score, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-2 rounded-full ${
                          score >= 900
                            ? "bg-green-500"
                            : score >= 700
                              ? "bg-blue-500"
                              : score >= 400
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        title={`Round ${idx + 1}: ${score}`}
                      ></div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* System Notice */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-xs text-blue-300 text-center font-semibold">⏰ Round 6 starts in 3...2...1...</div>
          </div>
        </Card>

        {/* Right Column: Chat + Players */}
        <div className="space-y-4">
          {/* Players List */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-4">
            <h3 className="text-sm font-bold text-purple-100 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Players (4/8)
            </h3>
            <div className="space-y-2">
              {[
                { name: "ColorMaster", host: true, typing: false },
                { name: "You", host: false, typing: false },
                { name: "RGBKing", host: false, typing: true },
                { name: "PixelPro", host: false, typing: false },
              ].map((player, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-purple-200">{player.name}</span>
                  {player.host && <Crown className="h-3 w-3 text-yellow-400" />}
                  {player.typing && <span className="text-xs text-purple-400 italic">typing...</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* Chat */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border-purple-500/20 p-4 flex flex-col h-[500px]">
            <h3 className="text-sm font-bold text-purple-100 mb-3">Chat</h3>
            <ScrollArea className="flex-1 mb-3">
              <div className="space-y-3">
                <div className="text-xs">
                  <div className="text-purple-400 font-semibold">ColorMaster</div>
                  <div className="text-purple-200 mt-0.5">Good luck everyone! 🎨</div>
                </div>
                <div className="text-xs bg-blue-500/10 p-2 rounded border border-blue-500/30">
                  <div className="text-blue-300 text-center">System: Round 5 started</div>
                </div>
                <div className="text-xs">
                  <div className="text-purple-400 font-semibold">RGBKing</div>
                  <div className="text-purple-200 mt-0.5">That was close! 😅</div>
                </div>
                <div className="text-xs">
                  <div className="text-purple-400 font-semibold">You</div>
                  <div className="text-purple-200 mt-0.5">Great match! 🔥</div>
                </div>
                <div className="text-xs">
                  <div className="text-purple-400 font-semibold">PixelPro</div>
                  <div className="text-purple-200 mt-0.5">Nice one! ⚡</div>
                </div>
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50"
              />
              <Button size="icon" variant="ghost" className="text-purple-300 hover:text-purple-100">
                <Smile className="h-4 w-4" />
              </Button>
              <Button size="icon" className="bg-purple-600 hover:bg-purple-500">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Host Controls Modal */}
      {showHostControls && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-purple-500/30 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Host Controls
            </h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30">
                <Play className="h-4 w-4 mr-2" />
                Start Next Round
              </Button>
              <Button className="w-full justify-start bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30">
                <Pause className="h-4 w-4 mr-2" />
                Pause Match
              </Button>
              <Button className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30">
                <Settings className="h-4 w-4 mr-2" />
                Adjust Round Count
              </Button>
              <Button className="w-full justify-start bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30">
                End Match
              </Button>
              <Button
                variant="outline"
                className="w-full border-purple-500/30 text-purple-300 bg-transparent"
                onClick={() => setShowHostControls(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
