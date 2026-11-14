"use client";

import { useEffect } from "react";
import { Pencil, RotateCcw, Trophy } from "lucide-react";

import { EmojiPicker } from "@/components/emoji-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LABEL, getWinner, useGameStore } from "@/store/game-store";

/** A big score number that pops whenever it changes. */
function Score({ value, label }: { value: number; label: string }) {
  return (
    <span
      key={value}
      aria-label={`${label}: ${value}`}
      className={cn("text-3xl font-bold tabular-nums", value > 0 && "animate-badge-pop")}
    >
      {value}
    </span>
  );
}

function Mark({
  emoji,
  label,
  className,
  animate = false,
}: {
  emoji: string;
  /** Omit when the text next to it already names the player. */
  label?: string;
  className?: string;
  animate?: boolean;
}) {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cn("inline-block leading-none select-none", animate && "animate-mark-pop", className)}
    >
      {emoji}
    </span>
  );
}

export default function Home() {
  const { squares, current, marks, scores, play, newGame, resetScores, setMark } = useGameStore();

  // Load the saved game from localStorage once we're in the browser.
  useEffect(() => {
    useGameStore.persist.rehydrate();
  }, []);

  const winner = getWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  const gameOver = Boolean(winner) || isDraw;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Tic-Tac-Toe</CardTitle>
          <CardDescription>Two players, one board. Get three in a row to win.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-5">
          <section aria-label="Scoreboard" className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2">
            {(["X", "draws", "O"] as const).map((key) =>
              key === "draws" ? (
                <div key={key} className="bg-muted/60 flex flex-col items-center justify-center rounded-lg px-3 py-2">
                  <span className="text-muted-foreground text-xs font-medium">Draws</span>
                  <Score value={scores.draws} label="Draws" />
                </div>
              ) : (
                <div
                  key={key}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                    !gameOver && current === key && "border-primary bg-primary/5",
                    winner?.player === key && "border-amber-400 bg-amber-50 dark:bg-amber-900/30"
                  )}
                >
                  <EmojiPicker
                    label={LABEL[key]}
                    value={marks[key]}
                    taken={marks[key === "X" ? "O" : "X"]}
                    onChange={(e) => setMark(key, e)}
                  />
                  <div className="flex items-center gap-1">
                    {winner?.player === key && <Trophy className="size-4 text-amber-500" aria-hidden />}
                    <Score value={scores[key]} label={`${LABEL[key]} wins`} />
                  </div>
                </div>
              )
            )}
          </section>

          <p className="text-muted-foreground -mt-3 flex items-center gap-1.5 text-center text-xs">
            <Pencil className="size-3 shrink-0" aria-hidden />
            Tap a player&apos;s emoji above to change their mark, anytime.
          </p>

          <div role="status" aria-live="polite" className="flex h-8 items-center">
            {winner ? (
              <Badge key="win" className="animate-badge-pop gap-1.5 px-3 py-1 text-base">
                🎉 <Mark emoji={marks[winner.player]} /> {LABEL[winner.player]} wins!
              </Badge>
            ) : isDraw ? (
              <Badge key="draw" variant="secondary" className="animate-badge-pop px-3 py-1 text-base">
                🤝 It&apos;s a draw!
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-base">
                <Mark emoji={marks[current]} /> {LABEL[current]}&apos;s turn
              </Badge>
            )}
          </div>

          <div className={cn("grid w-full grid-cols-3 gap-2", isDraw && "animate-draw-shake")}>
            {squares.map((value, i) => {
              const winIndex = winner ? winner.line.indexOf(i) : -1;
              const highlighted = winIndex !== -1;
              return (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => play(i)}
                  disabled={gameOver && !value}
                  aria-disabled={Boolean(value) || gameOver}
                  aria-label={`Square ${i + 1}: ${value ? LABEL[value] : "empty"}`}
                  className={cn(
                    "aspect-square h-auto w-full rounded-xl p-0 disabled:opacity-100",
                    value && "pointer-events-none animate-tile-pop",
                    gameOver && !highlighted && "opacity-60",
                    "transition-opacity duration-300",
                    highlighted &&
                      "animate-win-bounce bg-amber-100 border-amber-400 dark:bg-amber-900/40 dark:border-amber-500"
                  )}
                  style={highlighted ? { animationDelay: `${winIndex * 120}ms` } : undefined}
                >
                  {value && <Mark emoji={marks[value]} label={LABEL[value]} className="text-5xl sm:text-6xl" animate />}
                </Button>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button size="lg" onClick={newGame}>
            <RotateCcw /> New Game
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={resetScores}>
            Reset scores
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
