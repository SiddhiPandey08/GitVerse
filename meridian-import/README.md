# Meridian

A real-time video calling platform built with WebRTC — peer-to-peer video, live chat, screen sharing, and meeting history, wrapped in a fully custom design system.

**Live app:** [meridian-vst3.vercel.app](https://meridian-vst3.vercel.app)

## Overview

Meridian lets people jump into a video call in one click — no downloads, no signups required for guests. Hosts get accounts with meeting history, activity stats, and a personal profile; anyone can join instantly with just a meeting code.

## Features

### Landing & Onboarding
- Animated hero with a custom GSAP-driven spinning wordmark
- Scroll-triggered feature sections
- Guest join flow — no account needed, just a name and a code
- Login/Register with a tab-based auth screen

### Home Dashboard
- One-click instant meeting generation
- Join by meeting code
- Ambient animated background (multi-row marquee, GSAP-powered)

### Video Calling
- Peer-to-peer WebRTC video and audio (mesh architecture — a direct `RTCPeerConnection` per participant)
- Real-time signaling over Socket.io (offer/answer/ICE candidate exchange)
- Two layouts: spotlight view (manual focus + participant strip) and a grid view toggle
- Live text chat with an unread-message badge
- Screen sharing with a camera/screen view toggle
- Real-time mute/camera-off state broadcast to every participant
- Initials-based avatars generated client-side (no file upload or storage needed) shown when a camera is off
- One-click copy meeting link
- Toast notifications for connection issues and permission failures

### Profile & History
- Meeting history with one-click rejoin
- Profile page with derived stats — total meetings, meetings this month, most active day
- A GitHub-style activity heatmap built from meeting timestamps, rendered as custom SVG

### Design System
- A full token-based theme (color, type, spacing, radius) derived directly from the brand logo
- Two-typeface system — a display serif paired with a body sans
- Reusable components: `InitialsAvatar`, `MarqueeBackground`, `LogoMarquee`, `SpinningMark`

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Socket.io-client
- Native WebRTC APIs
- MUI (Material UI)
- GSAP
- Custom CSS token system (no Tailwind — hand-built design system)
- Axios

**Backend**
- Node.js + Express
- Socket.io
- MongoDB + Mongoose
- bcrypt
- crypto (token generation)
- CORS

**Infrastructure**
- Frontend on Vercel
- Backend on Render
- MongoDB Atlas
- Environment-based configuration for dev/prod

## Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB connection string (local or Atlas)

### Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

```bash
npm start
```

### Frontend
```bash
cd frontend
npm install
```

Create a `.env.development` file in `frontend/`:
```
VITE_SERVER_URL=http://localhost:5000
```

```bash
npm run dev
```

## Project Structure

```
Meridian/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── app.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── styles/
    └── public/
```



## License

This project is open source and available for anyone to explore or build on.
