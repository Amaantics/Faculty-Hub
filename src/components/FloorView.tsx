import { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { FacultyModal } from './FacultyModal';
import { StatusBadge } from './StatusBadge';
import { FLOORS_ORDERED, BLOCKS_BY_FLOOR, FLOOR_LABELS } from '../utils/floorUtils';
import { getEffectiveStatus, TITLE_BADGE_CLASSES } from '../utils/statusUtils';
import { FACULTY_DATA } from '../data/faculty';
import type { FacultyRecord, FacultyStatus, StatusOverrides, FacultyAccount } from '../types';

interface Props {
  overrides: StatusOverrides;
  onSetStatus: (id: number, status: FacultyStatus, note?: string) => void;
  onClearStatus: (id: number) => void;
  loggedInEmail?: string | null;
  getAccountByFacultyId?: (id: number) => FacultyAccount | undefined;
  onOpenAccount?: () => void;
  onLoginClick?: () => void;
}

export function FloorView({
  overrides, onSetStatus, onClearStatus,
  loggedInEmail, getAccountByFacultyId, onOpenAccount, onLoginClick,
}: Props) {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set(FLOORS_ORDERED));
  const [selected, setSelected] = useState<FacultyRecord | null>(null);

  const toggleFloor = (floor: string) => {
    setExpandedFloors(prev => {
      const next = new Set(prev);
      if (next.has(floor)) next.delete(floor); else next.add(floor);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {FLOORS_ORDERED.map(floor => {
        const blocks = BLOCKS_BY_FLOOR[floor];
        const floorFaculty = FACULTY_DATA.filter(f => f.floor === floor);
        const isExpanded = expandedFloors.has(floor);

        return (
          <div key={floor} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleFloor(floor)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-700">{floor}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 text-sm">{FLOOR_LABELS[floor]}</p>
                  <p className="text-xs text-slate-400">
                    {blocks.length} block{blocks.length !== 1 ? 's' : ''} · {floorFaculty.length} faculty
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusSummaryDots faculty={floorFaculty} overrides={overrides} />
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
                {blocks.map(block => {
                  const blockFaculty = FACULTY_DATA.filter(f => f.block === block);
                  if (blockFaculty.length === 0) return null;
                  return (
                    <div key={block}>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{block}</span>
                        <span className="text-xs text-slate-400">({blockFaculty.length})</span>
                      </div>
                      <div className="space-y-1 pl-5">
                        {blockFaculty.map(f => {
                          const acct = getAccountByFacultyId?.(f.id);
                          const isOwn = !!loggedInEmail && acct?.email === loggedInEmail;
                          return (
                            <FacultyRow
                              key={f.id}
                              faculty={f}
                              overrides={overrides}
                              onClick={setSelected}
                              isOwn={isOwn}
                              photoUrl={acct?.photoDataUrl}
                              displayName={acct?.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {selected && (
        <FacultyModal
          faculty={selected}
          overrides={overrides}
          onSetStatus={onSetStatus}
          onClearStatus={onClearStatus}
          onClose={() => setSelected(null)}
          account={getAccountByFacultyId?.(selected.id)}
          loggedInEmail={loggedInEmail}
          onOpenAccount={onOpenAccount}
          onLoginClick={onLoginClick}
        />
      )}
    </div>
  );
}

function FacultyRow({
  faculty, overrides, onClick, isOwn, photoUrl, displayName,
}: {
  faculty: FacultyRecord;
  overrides: StatusOverrides;
  onClick: (f: FacultyRecord) => void;
  isOwn?: boolean;
  photoUrl?: string;
  displayName?: string;
}) {
  const status = getEffectiveStatus(faculty, overrides);
  const titleClass = TITLE_BADGE_CLASSES[faculty.title] ?? 'bg-slate-100 text-slate-700';
  const name = displayName ?? faculty.name;

  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const avatarBg =
    faculty.title === 'Dr.'   ? 'bg-indigo-100 text-indigo-700' :
    faculty.title === 'Prof.' ? 'bg-violet-100 text-violet-700' :
                                'bg-slate-100 text-slate-700';

  return (
    <button
      onClick={() => onClick(faculty)}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left group ${
        isOwn ? 'ring-1 ring-indigo-200 bg-indigo-50/40' : ''
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        status === 'available' ? 'bg-green-500' :
        status === 'in_class'  ? 'bg-blue-500'  :
        status === 'away'      ? 'bg-amber-500' : 'bg-red-400'
      }`} />

      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-indigo-200" />
      ) : (
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${avatarBg}`}>
          {initials[0]}
        </span>
      )}

      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${titleClass}`}>
        {faculty.title}
      </span>
      <span className="text-sm text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
        {name}{isOwn && <span className="ml-1 text-indigo-500 text-xs">★</span>}
      </span>
      <span className="ml-auto text-xs text-slate-400 flex-shrink-0 hidden sm:block">{faculty.cabinPosition}</span>
      <StatusBadge status={status} size="sm" showDot={false} />
    </button>
  );
}

function StatusSummaryDots({ faculty, overrides }: { faculty: FacultyRecord[]; overrides: StatusOverrides }) {
  const counts = { available: 0, in_class: 0, away: 0, on_leave: 0 };
  faculty.forEach(f => counts[getEffectiveStatus(f, overrides)]++);

  return (
    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mr-2">
      {counts.available > 0  && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />{counts.available}</span>}
      {counts.in_class > 0  && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"  />{counts.in_class}</span>}
      {counts.away > 0      && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{counts.away}</span>}
      {counts.on_leave > 0  && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"   />{counts.on_leave}</span>}
    </div>
  );
}
