import { useState, useEffect, useRef } from 'react';
import { X, Search, LogIn, KeyRound, UserCheck, ChevronLeft } from 'lucide-react';
import { FACULTY_DATA } from '../data/faculty';
import type { FacultyRecord } from '../types';

interface Props {
  hasProfile: (id: number) => boolean;
  verifyPin: (id: number, pin: string) => boolean;
  onCreateProfile: (id: number, pin: string) => void;
  onLogin: (id: number) => void;
  onClose: () => void;
}

type Step = 'select' | 'pin_existing' | 'pin_new' | 'pin_confirm';

export function FacultyLoginModal({
  hasProfile, verifyPin, onCreateProfile, onLogin, onClose,
}: Props) {
  const [step, setStep] = useState<Step>('select');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FacultyRecord | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [success, setSuccess] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Auto-focus
  useEffect(() => {
    if (step === 'select') searchRef.current?.focus();
    if (step !== 'select') setTimeout(() => pinRef.current?.focus(), 50);
  }, [step]);

  const filtered = FACULTY_DATA.filter(f =>
    f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (f: FacultyRecord) => {
    setSelected(f);
    setPin('');
    setConfirmPin('');
    setPinError('');
    setStep(hasProfile(f.id) ? 'pin_existing' : 'pin_new');
  };

  const handleExistingLogin = () => {
    if (!selected) return;
    if (pin.length < 4) { setPinError('PIN must be 4 digits'); return; }
    if (!verifyPin(selected.id, pin)) {
      setPinError('Incorrect PIN. Please try again.');
      setPin('');
      return;
    }
    setPinError('');
    setSuccess(true);
    setTimeout(() => {
      onLogin(selected.id);
      onClose();
    }, 800);
  };

  const handleNewPinNext = () => {
    if (pin.length < 4) { setPinError('PIN must be exactly 4 digits'); return; }
    setPinError('');
    setStep('pin_confirm');
  };

  const handleConfirmSetup = () => {
    if (!selected) return;
    if (confirmPin !== pin) {
      setPinError('PINs do not match. Try again.');
      setConfirmPin('');
      return;
    }
    onCreateProfile(selected.id, pin);
    setPinError('');
    setSuccess(true);
    setTimeout(() => {
      onLogin(selected.id);
      onClose();
    }, 800);
  };

  const handlePinInput = (val: string, setter: (v: string) => void) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setter(digits);
    setPinError('');
  };

  const initials = (f: FacultyRecord) =>
    f.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const avatarBg = (f: FacultyRecord) =>
    f.title === 'Dr.' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'select' && (
              <button
                onClick={() => { setStep('select'); setSelected(null); setPin(''); setConfirmPin(''); setPinError(''); }}
                className="text-slate-400 hover:text-white mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <LogIn className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold text-sm">Faculty Portal</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success state */}
        {success && (
          <div className="flex flex-col items-center justify-center py-10 px-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <UserCheck className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-bold text-slate-800 text-lg">Logged in!</p>
            <p className="text-sm text-slate-500 mt-1">Welcome, {selected?.name}</p>
          </div>
        )}

        {/* Step 1: Select faculty */}
        {!success && step === 'select' && (
          <div>
            <div className="px-5 pt-4 pb-2">
              <p className="text-sm text-slate-500 mb-3">Select your name to sign in or create your faculty profile.</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search your name…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-64 px-3 pb-4 space-y-1">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">No faculty found</p>
              ) : (
                filtered.map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleSelect(f)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarBg(f)}`}>
                      {initials(f)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{f.fullName}</p>
                      <p className="text-xs text-slate-400">{f.block} · {f.floor} Floor</p>
                    </div>
                    {hasProfile(f.id) && (
                      <span className="ml-auto text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Profile ✓
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2a: Existing user — enter PIN */}
        {!success && step === 'pin_existing' && selected && (
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarBg(selected)}`}>
                {initials(selected)}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{selected.fullName}</p>
                <p className="text-xs text-slate-400">{selected.block} · {selected.floor} Floor</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enter your PIN</label>
              <div className="mt-2 flex gap-2 justify-center">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${pin[i] ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`}>
                    {pin[i] ? '●' : ''}
                  </div>
                ))}
              </div>
              <input
                ref={pinRef}
                type="number"
                value={pin}
                onChange={e => handlePinInput(e.target.value, setPin)}
                onKeyDown={e => { if (e.key === 'Enter') handleExistingLogin(); }}
                placeholder="Enter 4-digit PIN"
                className="mt-3 w-full text-center rounded-lg border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                inputMode="numeric"
              />
              {pinError && <p className="mt-1.5 text-xs text-red-500 text-center">{pinError}</p>}
            </div>

            <button
              onClick={handleExistingLogin}
              disabled={pin.length < 4}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Sign In
            </button>
          </div>
        )}

        {/* Step 2b: New user — create PIN */}
        {!success && step === 'pin_new' && selected && (
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarBg(selected)}`}>
                {initials(selected)}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{selected.fullName}</p>
                <p className="text-xs text-green-600 font-medium">Setting up new profile</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Create a 4-digit PIN to secure your profile. You'll use this every time you sign in.</p>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Create PIN</label>
              <div className="mt-2 flex gap-2 justify-center">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${pin[i] ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'}`}>
                    {pin[i] ? '●' : ''}
                  </div>
                ))}
              </div>
              <input
                ref={pinRef}
                type="number"
                value={pin}
                onChange={e => handlePinInput(e.target.value, setPin)}
                onKeyDown={e => { if (e.key === 'Enter' && pin.length === 4) handleNewPinNext(); }}
                placeholder="Choose a 4-digit PIN"
                className="mt-3 w-full text-center rounded-lg border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                inputMode="numeric"
              />
              {pinError && <p className="mt-1.5 text-xs text-red-500 text-center">{pinError}</p>}
            </div>

            <button
              onClick={handleNewPinNext}
              disabled={pin.length < 4}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 3: Confirm PIN */}
        {!success && step === 'pin_confirm' && selected && (
          <div className="px-5 py-5 space-y-4">
            <p className="text-sm text-slate-600">Confirm your PIN to finish setting up your profile.</p>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm PIN</label>
              <div className="mt-2 flex gap-2 justify-center">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${confirmPin[i] ? 'border-violet-400 bg-violet-50' : 'border-slate-200'}`}>
                    {confirmPin[i] ? '●' : ''}
                  </div>
                ))}
              </div>
              <input
                ref={pinRef}
                type="number"
                value={confirmPin}
                onChange={e => handlePinInput(e.target.value, setConfirmPin)}
                onKeyDown={e => { if (e.key === 'Enter' && confirmPin.length === 4) handleConfirmSetup(); }}
                placeholder="Re-enter your PIN"
                className="mt-3 w-full text-center rounded-lg border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                inputMode="numeric"
              />
              {pinError && <p className="mt-1.5 text-xs text-red-500 text-center">{pinError}</p>}
            </div>

            <button
              onClick={handleConfirmSetup}
              disabled={confirmPin.length < 4}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Create Profile & Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
