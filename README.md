# 🎨 Color Match Challenge

A multiplayer color perception game built with Next.js 16 and Socket.IO. Test your ability to match colors using RGB sliders, compete with others in real-time, and climb the global leaderboards!

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## 🎮 Features

### 🕹️ Game Modes
- **Solo Challenge**: Test your skills in an 8-round session. Your results are saved to the global rankings!
- **Multiplayer**: Create custom rooms with unlimited rounds. Compete against friends in real-time.

### 🏆 Rankings & Stats
- **Weekly Global Leaderboard**: Compete for the top spot! Rankings reset every Monday.
- **Country Rankings**: Automatically detects your location to show local champions.
- **Live Solo Race**: Real-time horse race visualization showing your progress vs top 10 leaderboard during gameplay.
- **Detailed Stats**: Track your accuracy, total score, and improvement over time.

### ✨ Immersive Experience
- **Audio Feedback**: Distinct sounds for different score ranges (Excellent, Good, Fair, Poor).
- **Chat System**: Real-time chat with ICQ-style notification sounds (toggleable).
- **Visual Effects**: Floating score deltas, glassmorphism UI, and smooth animations.

### 🛠️ Tech Stack

- **Frontend**: Next.js 16.0.7, React 19.2.1, Tailwind CSS 4
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Better-SQLite3 (fast, serverless, reliable)
- **Type Safety**: Full TypeScript support across full stack

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:kiaruh/color-match-challenge.git
   cd color-match-challenge
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Run Locally**
   You need two terminal windows:

   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```
   *Server runs on http://localhost:3001*

   **Terminal 2 (Frontend):**
   ```bash
   npm run dev
   ```
   *Frontend runs on http://localhost:3000*

4. **Play!**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Scoring System

We use the **Euclidean distance** in RGB space to calculate accuracy:

```typescript
distance = √[(r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²]
score = max(0, 1000 - distance)
```

- **Perfect Match**: 1000 points
- **Excellent**: > 900 points (Fanfare sound 🎺)
- **Good**: > 700 points (Chime sound 🔔)
- **Fair**: > 400 points (Beep sound 🔉)
- **Poor**: < 400 points (Trombone sound 📉)

## 👤 Author

**kiaruh**
- GitHub: [@kiaruh](https://github.com/kiaruh)
- Email: nikoz.li@gmail.com

## 📄 License

MIT License. Feel free to use this project for learning!
