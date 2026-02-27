type Props = {
  current: number;
  total: number;
  gradient?: string;
};

export default function TrainerProgressBar({
  current,
  total,
  gradient,
}: Props) {
  const pct = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
  const gradientClass = gradient || "from-primary to-primary/80";

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {current}/{total}
        </span>
        <span className="text-xs text-muted-foreground/50">
          ({pct}%)
        </span>
      </div>
    </div>
  );
}
