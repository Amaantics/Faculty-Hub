import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Building2, RotateCcw, Clock, Mail, Phone, UserCircle, LogIn } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { RemarkBadge } from './RemarkBadge';
import {
  getEffectiveStatus,
  STATUS_CONFIG,
  TITLE_BADGE_CLASSES,
  formatTimestamp,
} from '../utils/statusUtils';
import { FLOOR_LABELS } from '../utils/floorUtils';
import type { FacultyRecord, FacultyStatus, StatusOverrides, FacultyAccount } from '../types';

interface Props {
  faculty: FacultyRecord;
  overrides: StatusOverrides;
  onSetStatus: (id: number, status: FacultyStatus, note?: string) => void;
  onClearStatus: (id: number) => void;
  onClose: () => void;
  /** Account linked to this faculty record */
  account?: FacultyAccount;
  /** Email of currently logged-in user */
  loggedInEmail?: string | null;
  /** Open the "My Account" modal (only shown for own profile) */
  onOpenAccount?: () => void;
  /** Open the sign-in modal (shown when nobody is logged in) */
  onLoginClick?: () => void;
}

const ALL_STATUSES: FacultyStatus[] = ['available', 'in_class', 'away', 'on_leave'];

export function FacultyModal({
  faculty, overrides, onSetStatus, onClearStatus, onClose,
  account, loggedInEmail, onOpenAccount, onLoginClick,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [noteText, setNoteText] = useState(overrides[faculty.id]?.note ?? '');

  const status       = getEffectiveStatus(faculty, overrides);
  const override     = overrides[faculty.id];
  const isOverridden = !!override;
  const titleClass   = TITLE_BADGE_CLASSES[faculty.title] ?? 'bg-slate-100 text-slate-700';

  // "Own profile" = logged-in user's account is linked to this faculty record
  const isOwn = !!loggedInEmail && account?.email === loggedInEmail;

  const displayName  = account?.name ?? faculty.name;
  const displayBlock = account?.block ?? faculty.block;
  const displayFloor = account?.floor ?? faculty.floor;
  const displayCabin = account?.cabinPosition ?? faculty.cabinPosition;
  const photoUrl     = account?.photoDataUrl;

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const avatarBg =
    faculty.title === 'Dr.'   ? 'bg-indigo-200 text-indigo-700' :
    faculty.title === 'Prof.' ? 'bg-violet-200 text-violet-700' :
                                'bg-slate-200 text-slate-700';

  useEffect(() => { closeBtnRef.current?.focus(); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSetStatus = (s: FacultyStatus) => {
    onSetStatus(faculty.id, s, noteText || undefined);
  };

  const handleReset = () => {
    onClearStatus(faculty.id);
    setNoteText('');
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-indigo-100" />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${avatarBg}`}>
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${titleClass}`}>
                  {faculty.title}
                </span>
                <StatusBadge status={status} />
                {isOwn && (
                  <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-medium">You ★</span>
                )}
              </div>
              <h2 className="font-bold text-slate-800 mt-1 leading-tight">{displayName}</h2>
              <p className="text-xs text-slate-400">Sr. No. #{faculty.id}</p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Location ── */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</h3>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500">Floor:</span>
                <span className="font-medium text-slate-700">{FLOOR_LABELS[displayFloor]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500">Block:</span>
                <span className="font-medium text-slate-700">{displayBlock}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 flex-shrink-0 text-slate-400 text-center text-base">≡</span>
                <span className="text-slate-500">Seat:</span>
                <span className="font-medium text-slate-700">{displayCabin}</span>
              </div>
            </div>
          </section>

          {/* ── Contact (from account) ── */}
          {account && (account.email || account.phone) && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${account.email}`} className="text-indigo-600 hover:text-indigo-800 truncate" onClick={e => e.stopPropagation()}>
                    {account.email}
                  </a>
                </div>
                {account.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a href={`tel:${account.phone}`} className="text-indigo-600 hover:text-indigo-800" onClick={e => e.stopPropagation()}>
                      {account.phone}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Remarks ── */}
          {faculty.remarkType !== 'none' && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Note</h3>
              <div className="flex items-start gap-2">
                <RemarkBadge remarkType={faculty.remarkType} />
                {faculty.rawRemark && <p className="text-sm text-slate-600">{faculty.rawRemark}</p>}
              </div>
            </section>
          )}

          {/* ═══════════════════════════════════════
              OWN PROFILE — full admin controls
          ═══════════════════════════════════════ */}
          {isOwn ? (
            <>
              {/* Status selector */}
              <section>
                <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  My Status
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_STATUSES.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleSetStatus(s)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          isActive
                            ? `${cfg.btnClasses} border-transparent shadow-sm`
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 justify-center">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-white' : cfg.dotClass}`} />
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Leave reason / note */}
              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Leave Reason / Note</h3>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="e.g. On medical leave, Back at 3 pm, In Room 204…"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
                {noteText.trim() && (
                  <button onClick={() => handleSetStatus(status)} className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    Save note with current status →
                  </button>
                )}
              </section>

              {/* Override timestamp */}
              {isOverridden && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Manually set</span>
                  </div>
                  <p className="text-xs text-amber-600">Updated: {formatTimestamp(override.updatedAt)}</p>
                  {override.note && <p className="text-xs text-amber-700 mt-1 italic">"{override.note}"</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {isOverridden && (
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
                {onOpenAccount && (
                  <button
                    onClick={() => { onClose(); onOpenAccount(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-medium"
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    My Account
                  </button>
                )}
                <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                  Done
                </button>
              </div>
            </>
          ) : (
            /* ═══════════════════════════════════════
               OTHER PROFILE — read-only
            ═══════════════════════════════════════ */
            <>
              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Status</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={status} />
                  {override?.note && <p className="text-sm text-slate-500 italic">"{override.note}"</p>}
                </div>
                {isOverridden && (
                  <p className="text-xs text-slate-400 mt-1.5">Updated: {formatTimestamp(override.updatedAt)}</p>
                )}
              </section>

              {/* Login prompt when nobody is logged in */}
              {!loggedInEmail && onLoginClick && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-700 font-medium">Is this you?</p>
                    <p className="text-xs text-indigo-500">Sign in or create an account to manage your availability.</p>
                  </div>
                  <button
                    onClick={() => { onClose(); onLoginClick(); }}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 flex-shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="pt-1">
                <button onClick={onClose} className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
