import { STATUS_CONFIG } from '../utils/statusUtils';
import type { FacultyStatus } from '../types';

interface Props {
  status: FacultyStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'md', showDot = true }: Props) {
  const cfg = STATUS_CONFIG[status];
  const text = size === 'sm' ? 'text-xs' : 'text-xs';
  const pad  = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${text} ${pad} ${cfg.badgeClasses}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
      )}
      {cfg.label}
    </span>
  );
}
