"use client";
export function DateSelector({ dateOffset, setDateOffset }: { dateOffset: number; setDateOffset: (offset: number) => void }) {

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setDateOffset(-1)}
        className={`rounded-full px-4 py-2 text-sm transition ${
          dateOffset === -1
            ? "bg-primary font-semibold text-primary-foreground"
            : "border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Yesterday
      </button>

      <button
        onClick={() => setDateOffset(0)}
        className={`rounded-full px-5 py-2 text-sm transition ${
          dateOffset === 0
            ? "bg-primary font-semibold text-primary-foreground"
            : "border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Today
      </button>

      <button
        onClick={() => setDateOffset(1)}
        className={`rounded-full px-4 py-2 text-sm transition ${
          dateOffset === 1
            ? "bg-primary font-semibold text-primary-foreground"
            : "border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        Tomorrow
      </button>
    </div>
  );
}
