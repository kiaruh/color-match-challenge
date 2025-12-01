# 🎨 Color Match Challenge

A multiplayer color perception game built with Next.js and Socket.IO. Test your ability to match colors using RGB sliders and compete with others in real-time!

![Color Match Challenge](https://img.shields.io/badge/Next.js-16.0.4-black?style=for-the-badge&logo=next.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-010101?style=for-the-badge&logo=socket.io)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## 🎮 Features

- **🎨 Color Perception Test** - Match target colors using RGB sliders
- **⚡ Real-time Multiplayer** - Compete with others via WebSocket connections
- **🏆 Live Leaderboard** - See scores update in real-time
- **📊 Scoring System** - Points based on color accuracy
- **🎯 3 Round Games** - Complete sessions with varying difficulty

## 🚀 Live Demo

**Repository:** [github.com/kiaruh/color-match-challenge](https://github.com/kiaruh/color-match-challenge)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Socket.IO Client** - Real-time communication

### Backend
- **Express** - Web server
- **Socket.IO** - WebSocket server
- **Better-SQLite3** - Database
- **TypeScript** - Type safety

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Clone Repository

```bash
git clone git@github.com:kiaruh/color-match-challenge.git
cd color-match-challenge
```

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (defaults work for local development).

## 🏃 Running Locally

You need to run both the frontend and backend servers:

### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3001`

### Terminal 2 - Frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser to play!

## 🎯 How to Play

1. **Create or Join a Game**
   - Click "Create New Game" to start a session
   - Share the Session ID with friends to play together
   - Or enter a Session ID to join an existing game

2. **Match the Color**
   - Use the RGB sliders to match the target color
   - The closer your match, the higher your score
   - Complete 3 rounds per game

3. **Compete**
   - Watch the leaderboard update in real-time
   - See how you rank against other players
   - Winner is announced at the end!

## 📁 Project Structure

```
color-match-challenge/
├── src/                      # Frontend source
│   ├── app/                  # Next.js app directory
│   │   ├── page.tsx         # Main game page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── GameBoard.tsx    # Main game interface
│   │   ├── ColorPicker.tsx  # RGB color selector
│   │   └── Leaderboard.tsx  # Score display
│   ├── hooks/               # Custom React hooks
│   │   └── useWebSocket.ts  # WebSocket connection
│   └── utils/               # Utility functions
│       ├── api.ts           # API client
│       └── colorUtils.ts    # Color calculations
├── server/                   # Backend source
│   └── src/
│       ├── index.ts         # Express server
│       ├── db/              # Database setup
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       └── sockets/         # WebSocket handlers
└── public/                   # Static assets
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub (already done!)
2. Visit [vercel.com](https://vercel.com)
3. Import your repository: `kiaruh/color-match-challenge`
4. Vercel will auto-detect Next.js and deploy both frontend and backend
5. Your app will be live at `https://your-app.vercel.app`

### Environment Variables for Production

Set these in your deployment platform:

```env
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_WS_URL=https://your-app.vercel.app
```

## 🎨 Color Matching Algorithm

The game uses Euclidean distance in RGB color space to calculate accuracy:

```typescript
distance = √[(r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²]
score = max(0, 1000 - distance)
```

Perfect match = 1000 points!

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning or your own games!

## 👤 Author

**kiaruh**
- GitHub: [@kiaruh](https://github.com/kiaruh)
- Email: nikoz.li@gmail.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time features powered by [Socket.IO](https://socket.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Enjoy the game! 🎨✨**
