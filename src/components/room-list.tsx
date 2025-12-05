"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Lock, Unlock } from "lucide-react"

const mockRooms = [
  { id: 1, name: "Pro Players Only", players: 3, maxPlayers: 4, isPrivate: false, host: "ColorMaster" },
  { id: 2, name: "Chill Vibes", players: 2, maxPlayers: 6, isPrivate: false, host: "RainbowKid" },
  { id: 3, name: "Speed Run", players: 4, maxPlayers: 4, isPrivate: true, host: "FastFingers" },
  { id: 4, name: "Beginners Welcome", players: 1, maxPlayers: 8, isPrivate: false, host: "HelpfulHue" },
]

export function RoomList() {
  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Active Rooms</h3>
        <Badge variant="secondary">{mockRooms.length} rooms</Badge>
      </div>

      <div className="space-y-3">
        {mockRooms.map((room) => (
          <div
            key={room.id}
            className="glass p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{room.name}</h4>
                  {room.isPrivate ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Unlock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {room.players}/{room.maxPlayers}
                  </span>
                  <span>Host: {room.host}</span>
                </div>
              </div>

              <Button size="sm" disabled={room.players >= room.maxPlayers}>
                {room.players >= room.maxPlayers ? "Full" : "Join"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
