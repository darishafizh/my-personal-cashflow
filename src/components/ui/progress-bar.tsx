import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function ProgressBar({ percentage, size = 'md', showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const getColor = () => {
    if (percentage >= 100) return 'bg-danger';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  const getGlow = () => {
    if (percentage >= 100) return 'shadow-[0_0_12px_rgba(255,107,107,0.4)]';
    if (percentage >= 75) return 'shadow-[0_0_12px_rgba(255,217,61,0.3)]';
    return 'shadow-[0_0_12px_rgba(0,245,212,0.3)]';
  };

  return (
    <div className="w-full">
      <div className={cn(
        'w-full rounded-full overflow-hidden bg-white/[0.08]',
        size === 'sm' ? 'h-1.5' : 'h-2.5'
      )}>
        <div
          className={cn(
            'h-full rounded-full progress-bar-fill',
            getColor(),
            getGlow()
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className={cn(
            'text-xs font-semibold',
            percentage >= 100 ? 'text-danger' : percentage >= 75 ? 'text-warning' : 'text-primary'
          )}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
