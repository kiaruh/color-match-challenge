# 🎨 Color Match Challenge

> **Think you have a good eye for color?** Prove it! Match target colors using RGB sliders, compete in real-time multiplayer, and dominate the global leaderboards. It's harder than it looks. 👀

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

---

## 🎯 What's This About?

Color Match Challenge is a **color perception game** that tests how accurately you can recreate colors using just RGB sliders. No eyedropper tools, no hex codes—just you, three sliders, and your eyeballs.

Perfect for designers, developers, or anyone who's ever argued about whether something is "blue" or "periwinkle."

---

## ✨ What Makes It Fun?

### 🕹️ **Two Ways to Play**

- **🏃 Solo Challenge** — 8 rounds of pure color-matching intensity. Beat your personal best and climb the weekly global leaderboard!
- **👥 Multiplayer Madness** — Create a room, invite friends, and see who's got the best color perception. Unlimited rounds, real-time competition, and bragging rights on the line.

### 🏆 **Competitive Features**

- **🌍 Global Leaderboard** — Weekly rankings that reset every Monday. Can you claim the #1 spot?
- **🚩 Country Rankings** — Automatically detects your location so you can rep your country!
- **🐴 Live Race Visualization** — Watch yourself compete against the top 10 players in real-time during solo mode. It's like a horse race, but with colors.

### 🎧 **Immersive Vibes**

- **🔊 Audio Feedback** — Different sounds for different scores:
  - 🎺 **Excellent** (>900 pts) — Fanfare!
  - 🔔 **Good** (>700 pts) — Pleasant chime
  - 🔉 **Fair** (>400 pts) — Friendly beep
  - 📉 **Poor** (<400 pts) — Sad trombone (we've all been there)
- **💬 Real-Time Chat** — Talk smack to your opponents with ICQ-style notification sounds (toggleable, because we're not monsters)
- **✨ Smooth Animations** — Floating score deltas, glassmorphism UI, and buttery transitions

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18 or higher
- npm or yarn
- A working pair of eyes (preferably calibrated)

### **Installation**

**1. Clone this bad boy**
```bash
git clone git@github.com:kiaruh/color-match-challenge.git
cd color-match-challenge
```

**2. Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

**3. Fire it up!**

You'll need **two terminal windows** (or tabs, we don't judge):

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
🟢 Server runs on `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
npm run dev
```
🟢 Frontend runs on `http://localhost:3000`

**4. Play!**

Open [http://localhost:3000](http://localhost:3000) and start matching! 🎨

---

## 🧮 How Scoring Works

We calculate your accuracy using **Euclidean distance** in RGB color space. Fancy, right?

```typescript
distance = √[(r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²]
score = max(0, 1000 - distance)
```

**Translation:** The closer your color is to the target, the higher your score!

| Score Range | Rating | Sound Effect |
|------------|--------|--------------|
| **1000** | 🎯 Perfect Match | 🎺 Fanfare |
| **900+** | 🌟 Excellent | 🎺 Fanfare |
| **700+** | 👍 Good | 🔔 Chime |
| **400+** | 😐 Fair | 🔉 Beep |
| **<400** | 😬 Poor | 📉 Trombone |

---

## 🛠️ Tech Stack

Built with modern web tech for speed, reliability, and type safety:

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Node.js, Express, Socket.IO
- **Database:** Better-SQLite3 (fast, serverless, zero config)
- **Language:** TypeScript everywhere (because we like our bugs caught at compile time)

---

## 🎮 Pro Tips

1. **Calibrate your monitor** — Seriously, it helps!
2. **Start with one channel** — Get red right, then green, then blue
3. **Use the preview** — Toggle between your color and the target
4. **Practice in solo mode** — Build muscle memory before challenging friends
5. **Don't trust your eyes** — They lie more than you think 👁️

---

## 🤝 Contributing

Found a bug? Have an idea? PRs are welcome! This is a learning project, so don't be shy.

---

## 👤 Made By

**kiaruh**
- 🐙 GitHub: [@kiaruh](https://github.com/kiaruh)
- 📧 Email: nikoz.li@gmail.com

---

## 📄 License

MIT License — Use it, learn from it, build something cool! 🚀
