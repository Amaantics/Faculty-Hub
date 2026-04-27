import { MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { RemarkBadge } from './RemarkBadge';
import { getEffectiveStatus, TITLE_BADGE_CLASSES } from '../utils/statusUtils';
import type { FacultyRecord, FacultyAccount, StatusOverrides } from '../types';

interface Props {
  faculty: FacultyRecord;
  overrides: StatusOverrides;
  onClick: (f: FacultyRecord) => void;
  /** Account linked to this faculty record (may be undefined) */
  account?: FacultyAccount;
  /** Email of the currently logged-in faculty */
  loggedInEmail?: string | null;
}

export function FacultyCard({ faculty, overrides, onClick, account, loggedInEmail }: Props) {
  const status = getEffectiveStatus(faculty, overrides);
  const titleClass = TITLE_BADGE_CLASSES[faculty.title] ?? 'bg-slate-100 text-slate-700';

  // Use account data where available (overrides hardcoded)
  const displayName = account?.name ?? faculty.name;
  const displayBlock = account?.block ?? faculty.block;
  const displayCabin = account?.cabinPosition ?? faculty.cabinPosition;
  const displayFloor = account?.floor ?? faculty.floor;
  const photoUrl = account?.photoDataUrl;
  const isOwn = !!loggedInEmail && account?.email === loggedInEmail;

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const avatarBg =
    faculty.title === 'Dr.'   ? 'bg-indigo-100 text-indigo-700' :
    faculty.title === 'Prof.' ? 'bg-violet-100 text-violet-700' :
                                'bg-slate-100 text-slate-700';

  return (
    <button
      onClick={() => onClick(faculty)}
      className={`faculty-card w-full text-left bg-white rounded-xl border p-4 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-all ${
        isOwn
          ? 'border-indigo-300 ring-1 ring-indigo-200 shadow-sm'
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* Top row: title + badges */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${titleClass}`}>
          {faculty.title}
        </span>
        <div className="flex items-center gap-1.5">
          {isOwn && (
            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
              You ★
            </span>
          )}
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-indigo-100"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarBg}`}>
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{displayName}</p>
          <p className="text-xs text-slate-500 mt-0.5">#{faculty.id}</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
        <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
        <span className="font-medium text-slate-600">{displayBlock}</span>
        <span className="text-slate-400">·</span>
        <span className="truncate">{displayCabin}</span>
      </div>

      <div className="text-xs text-slate-400 mb-2">{displayFloor} Floor</div>

      {faculty.remarkType !== 'none' && (
        <RemarkBadge remarkType={faculty.remarkType} rawRemark={faculty.rawRemark} />
      )}
    </button>
  );
}
