import { useState } from 'react';
import { Sidebar, MobileNav } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FacultyGrid } from './components/FacultyGrid';
import { FloorView } from './components/FloorView';
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { MITLogo } from './components/MITLogo';
import { useFacultyStatus } from './hooks/useFacultyStatus';
import { useAuth } from './hooks/useAuth';
import { useFacultyAccounts } from './hooks/useFacultyAccounts';
import type { View } from './components/Sidebar';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [showAuthModal, setShowAuthModal]       = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Status overrides
  const { overrides, setStatus, clearStatus, clearAll, overrideCount } = useFacultyStatus();

  // Auth
  const { loggedInEmail, login, logout } = useAuth();

  // Accounts
  const {
    accounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountByEmail,
    getAccountByFacultyId,
    verifyPin,
    hasAccount,
  } = useFacultyAccounts();

  const loggedInAccount = loggedInEmail ? getAccountByEmail(loggedInEmail) : null;

  const handleLogout = () => {
    logout();
    setShowAccountModal(false);
  };

  const handleDeleteAccount = () => {
    if (loggedInEmail) {
      deleteAccount(loggedInEmail);
      logout();
    }
    setShowAccountModal(false);
  };

  const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard',         subtitle: 'Overview of faculty availability' },
    grid:      { title: 'Faculty Directory', subtitle: 'Search and browse all faculty members' },
    floor:     { title: 'Floor Map',         subtitle: 'Faculty organised by floor and block' },
  };

  const { title, subtitle } = VIEW_TITLES[activeView];

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        loggedInAccount={loggedInAccount}
        onLoginClick={() => setShowAuthModal(true)}
        onAccountClick={() => setShowAccountModal(true)}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0">

        {/* Page header */}
        <header className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 px-5 md:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile brand */}
              <div className="md:hidden flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">FH</span>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight">{title}</h1>
                <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
              </div>
            </div>

            {/* Right: logo + mobile login */}
            <div className="flex items-center gap-3">
              {!loggedInEmail && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="md:hidden text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Login
                </button>
              )}
              {loggedInAccount && (
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="md:hidden flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1.5 rounded-lg font-medium"
                >
                  {loggedInAccount.photoDataUrl ? (
                    <img src={loggedInAccount.photoDataUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[8px] flex items-center justify-center font-bold">
                      {loggedInAccount.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  My Account
                </button>
              )}
              <MITLogo compact className="hidden sm:block" />
            </div>
          </div>
        </header>

        {/* View content */}
        <div className="flex-1 px-5 md:px-8 py-6">
          {activeView === 'dashboard' && (
            <Dashboard overrides={overrides} overrideCount={overrideCount} onClearAll={clearAll} />
          )}
          {activeView === 'grid' && (
            <FacultyGrid
              overrides={overrides}
              onSetStatus={setStatus}
              onClearStatus={clearStatus}
              loggedInEmail={loggedInEmail}
              accounts={accounts}
              getAccountByFacultyId={getAccountByFacultyId}
              onOpenAccount={() => setShowAccountModal(true)}
              onLoginClick={() => setShowAuthModal(true)}
            />
          )}
          {activeView === 'floor' && (
            <FloorView
              overrides={overrides}
              onSetStatus={setStatus}
              onClearStatus={clearStatus}
              loggedInEmail={loggedInEmail}
              getAccountByFacultyId={getAccountByFacultyId}
              onOpenAccount={() => setShowAccountModal(true)}
              onLoginClick={() => setShowAuthModal(true)}
            />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav
        activeView={activeView}
        onViewChange={setActiveView}
        isLoggedIn={!!loggedInEmail}
        onLoginClick={loggedInEmail ? () => setShowAccountModal(true) : () => setShowAuthModal(true)}
      />

      {/* ── Modals ── */}
      {showAuthModal && (
        <AuthModal
          accounts={accounts}
          hasAccount={hasAccount}
          verifyPin={verifyPin}
          onCreateAccount={createAccount}
          onLogin={login}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showAccountModal && loggedInAccount && (
        <AccountModal
          account={loggedInAccount}
          onSave={updates => updateAccount(loggedInAccount.email, updates)}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  );
}
