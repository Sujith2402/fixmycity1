import { IssueStatus, IssuePriority } from '@/types';

interface StatusBadgeProps {
  status: IssueStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-${status} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize`}>
      {status.replace('-', ' ')}
    </span>
  );
}

interface PriorityDotProps {
  priority: IssuePriority;
  showLabel?: boolean;
}

export function PriorityDot({ priority, showLabel = false }: PriorityDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`priority-${priority} w-2 h-2 rounded-full`} />
      {showLabel && <span className="text-xs font-medium text-muted-foreground capitalize">{priority}</span>}
    </span>
  );
}
