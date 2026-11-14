# Tic-Tac-Toe

A two-player tic-tac-toe game built with **React 19**, **Next.js 15 (App Router)**, **Tailwind CSS v4**, **shadcn/ui** and **Zustand**.

- Two players take turns placing their emoji on a 3×3 board
- Each player picks their own emoji (🐱 🐶 🦊 … or paste any emoji); both can't use the same one
- Shows who won (winning line bounces) or that it's a draw (board shakes)
- **New Game** starts over; players alternate who goes first
- Scoreboard tracks wins for each player and draws, with **Reset scores**
- Board, turn, emoji and scores are kept in a global Zustand store persisted to `localStorage`, so a refresh doesn't lose anything

## Project layout

- `app/page.tsx`: game UI
- `store/game-store.ts`: global game state and rules (Zustand + `persist`)
- `components/emoji-picker.tsx`: emoji picker (shadcn Popover)
- `components/ui/*`: shadcn/ui components

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

Push to GitHub and import the repo at https://vercel.com/new. No configuration needed.
