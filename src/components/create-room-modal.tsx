"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Lock, Unlock } from "lucide-react"

interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("")
  const [rounds, setRounds] = useState("8")
  const [accessMode, setAccessMode] = useState<"public" | "private">("public")

  const handleCreate = () => {
    console.log("[v0] Creating room:", { roomName, rounds, accessMode })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Multiplayer Room</DialogTitle>
          <DialogDescription>Configure your room settings and invite players to join</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="glass"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rounds">Number of Rounds</Label>
            <Input
              id="rounds"
              type="number"
              min="1"
              placeholder="8"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
              className="glass"
            />
            <p className="text-xs text-muted-foreground">Leave empty for unlimited rounds</p>
          </div>

          <div className="space-y-3">
            <Label>Access Mode</Label>
            <RadioGroup value={accessMode} onValueChange={(value: "public" | "private") => setAccessMode(value)}>
              <div className="flex items-center space-x-2 glass p-3 rounded-lg border border-border/50">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Unlock className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-muted-foreground">Anyone can join</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 glass p-3 rounded-lg border border-border/50">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Lock className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-xs text-muted-foreground">Invite only</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="flex-1 neon-glow">
            Create Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
