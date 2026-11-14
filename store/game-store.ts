import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Player = "X" | "O";
export type Square = Player | null;
export type Scores = { X: number; O: number; draws: number };

export const LABEL: Record<Player, string> = { X: "Player 1", O: "Player 2" };
const DEFAULT_MARKS: Record<Player, string> = { X: "❌", O: "🔵" };
const EMPTY_BOARD: Square[] = Array(9).fill(null);
const EMPTY_SCORES: Scores = { X: 0, O: 0, draws: 0 };

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
] as const;

export function getWinner(squares: Square[]) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a] as Player, line: [a, b, c] as number[] };
    }
  }
  return null;
}

const other = (p: Player): Player => (p === "X" ? "O" : "X");

type GameState = {
  squares: Square[];
  current: Player;
  /** Who moved first this game — players alternate each new game. */
  starter: Player;
  marks: Record<Player, string>;
  scores: Scores;
  play: (i: number) => void;
  newGame: () => void;
  resetScores: () => void;
  setMark: (player: Player, emoji: string) => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      squares: EMPTY_BOARD,
      current: "X",
      starter: "X",
      marks: DEFAULT_MARKS,
      scores: EMPTY_SCORES,

      play: (i) => {
        const { squares, current, scores } = get();
        if (squares[i] || getWinner(squares) || squares.every(Boolean)) return;

        const next = squares.slice();
        next[i] = current;

        // Record the result the moment the game ends.
        const result = getWinner(next);
        let nextScores = scores;
        if (result) nextScores = { ...scores, [result.player]: scores[result.player] + 1 };
        else if (next.every(Boolean)) nextScores = { ...scores, draws: scores.draws + 1 };

        set({ squares: next, current: other(current), scores: nextScores });
      },

      newGame: () => {
        const starter = other(get().starter);
        set({ squares: EMPTY_BOARD, starter, current: starter });
      },

      resetScores: () => set({ scores: EMPTY_SCORES, squares: EMPTY_BOARD, starter: "X", current: "X" }),

      setMark: (player, emoji) => {
        const { marks } = get();
        if (marks[other(player)] === emoji) return; // both players can't share an emoji
        set({ marks: { ...marks, [player]: emoji } });
      },
    }),
    {
      name: "tic-tac-toe",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ squares, current, starter, marks, scores }) => ({ squares, current, starter, marks, scores }),
      // Rehydrate manually after mount so the server and first client render match.
      skipHydration: true,
    }
  )
);
