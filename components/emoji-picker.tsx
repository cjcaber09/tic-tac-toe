"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const EMOJI_CHOICES = [
  "❌", "🔵", "🐱", "🐶", "🦊", "🐸", "🐼", "🐵",
  "🦄", "🐷", "🐙", "🦖", "🔥", "💧", "⭐", "🌈",
  "🍕", "🍩", "👻", "🤖", "👽", "💀", "🎃", "⚽",
];

/** Returns the first emoji in a string, or null if there isn't one. */
function firstEmoji(text: string): string | null {
  const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text.trim());
  for (const { segment } of segments) {
    if (/\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(segment)) return segment;
  }
  return null;
}

export function EmojiPicker({
  label,
  value,
  taken,
  onChange,
}: {
  label: string;
  value: string;
  /** The other player's emoji — can't be picked. */
  taken: string;
  onChange: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  function choose(emoji: string) {
    onChange(emoji);
    setOpen(false);
    setCustom("");
    setError(null);
  }

  function submitCustom(e: React.FormEvent) {
    e.preventDefault();
    const emoji = firstEmoji(custom);
    if (!emoji) return setError("That's not an emoji — try pasting one 🙂");
    if (emoji === taken) return setError("The other player already has that one.");
    choose(emoji);
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); setError(null); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-full min-w-0 flex-col gap-1 px-2 py-2"
          aria-label={`${label} mark: ${value}. Change`}
        >
          <span className="text-3xl leading-none">{value}</span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-normal">
            {label} <Pencil className="size-3" aria-hidden />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="mb-3 text-sm font-medium">Pick a mark for {label}</p>
        <div className="grid grid-cols-6 gap-1">
          {EMOJI_CHOICES.map((emoji) => {
            const isTaken = emoji === taken;
            return (
              <Button
                key={emoji}
                variant={emoji === value ? "secondary" : "ghost"}
                size="icon"
                disabled={isTaken}
                onClick={() => choose(emoji)}
                aria-label={isTaken ? `${emoji} (taken by the other player)` : emoji}
                aria-pressed={emoji === value}
                className={cn("text-2xl", emoji === value && "ring-ring ring-2")}
              >
                {emoji}
              </Button>
            );
          })}
        </div>
        <form onSubmit={submitCustom} className="mt-3 flex gap-2">
          <Input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setError(null); }}
            placeholder="Or paste any emoji"
            aria-label="Custom emoji"
            aria-invalid={Boolean(error)}
          />
          <Button type="submit" variant="secondary">Use</Button>
        </form>
        {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
      </PopoverContent>
    </Popover>
  );
}
