import type { FacultyRecord, FacultyStatus, RemarkType, StatusOverrides } from '../types';

const LEAVE_REMARKS: RemarkType[] = ['medical_leave', 'maternity_leave', 'on_leave'];

/** Default status inferred from the remark type. */
export function getDefaultStatus(faculty: FacultyRecord): FacultyStatus {
  if (LEAVE_REMARKS.includes(faculty.remarkType)) return 'on_leave';
  return 'available';
}

/** Effective status: manual override takes precedence over default. */
export function getEffectiveStatus(
  faculty: FacultyRecord,
  overrides: StatusOverrides
): FacultyStatus {
  const override = overrides[faculty.id];
  if (override) return override.status;
  return getDefaultStatus(faculty);
}

export const STATUS_CONFIG: Record<
  FacultyStatus,
  { label: string; badgeClasses: string; dotClass: string; btnClasses: string; icon: string }
> = {
  available: {
    label: 'Available',
    badgeClasses: 'bg-green-100 text-green-800 border-green-200',
    dotClass: 'bg-green-500 status-dot-available',
    btnClasses: 'bg-green-500 hover:bg-green-600 text-white',
    icon: '✓',
  },
  in_class: {
    label: 'In Class',
    badgeClasses: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
    btnClasses: 'bg-blue-500 hover:bg-blue-600 text-white',
    icon: '📚',
  },
  away: {
    label: 'Away',
    badgeClasses: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    btnClasses: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: '↩',
  },
  on_leave: {
    label: 'On Leave',
    badgeClasses: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-400',
    btnClasses: 'bg-red-400 hover:bg-red-500 text-white',
    icon: '✗',
  },
};

export const TITLE_BADGE_CLASSES: Record<string, string> = {
  'Dr.': 'bg-indigo-100 text-indigo-800',
  'Prof.': 'bg-violet-100 text-violet-800',
  'Mr.': 'bg-slate-100 text-slate-700',
  'Mrs.': 'bg-slate-100 text-slate-700',
  'Ms.': 'bg-slate-100 text-slate-700',
  'Miss.': 'bg-slate-100 text-slate-700',
};

/** Format ISO timestamp to a readable local date-time string */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
