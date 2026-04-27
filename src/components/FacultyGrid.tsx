import { useState, useDeferredValue } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FacultyCard } from './FacultyCard';
import { FacultyModal } from './FacultyModal';
import { FilterPanel } from './FilterPanel';
import { useFilteredFaculty, EMPTY_FILTERS } from '../hooks/useSearch';
import { FACULTY_DATA } from '../data/faculty';
import type { FacultyRecord, FilterState, FacultyStatus, StatusOverrides, FacultyAccount, FacultyAccounts } from '../types';

interface Props {
  overrides: StatusOverrides;
  onSetStatus: (id: number, status: FacultyStatus, note?: string) => void;
  onClearStatus: (id: number) => void;
  loggedInEmail?: string | null;
  accounts?: FacultyAccounts;
  getAccountByFacultyId?: (id: number) => FacultyAccount | undefined;
  onOpenAccount?: () => void;
  onLoginClick?: () => void;
}

export function FacultyGrid({
  overrides, onSetStatus, onClearStatus,
  loggedInEmail, accounts, getAccountByFacultyId, onOpenAccount, onLoginClick,
}: Props) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<FacultyRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const deferredFilters = useDeferredValue(filters);
  const results = useFilteredFaculty(deferredFilters, overrides);
  const isStale = filters !== deferredFilters;

  const handleSearch = (q: string) => setFilters(f => ({ ...f, searchQuery: q }));
  const clearSearch  = () => setFilters(f => ({ ...f, searchQuery: '' }));

  const hasActiveFilters =
    filters.floors.length > 0 || filters.blocks.length > 0 ||
    filters.statuses.length > 0 || filters.remarkTypes.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-slate-50 pb-4 pt-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, block, or cabin…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            {filters.searchQuery && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              hasActiveFilters || showFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white" />}
          </button>
        </div>
        {showFilters && (
          <div className="lg:hidden mt-3 bg-white rounded-xl border border-slate-200 p-4">
            <FilterPanel filters={filters} onFiltersChange={setFilters} totalResults={results.length} totalFaculty={FACULTY_DATA.length} />
          </div>
        )}
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20">
            <FilterPanel filters={filters} onFiltersChange={setFilters} totalResults={results.length} totalFaculty={FACULTY_DATA.length} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-1">No faculty found</p>
              <p className="text-sm text-slate-500 mb-4">Try adjusting your search or clearing filters.</p>
              <button onClick={() => setFilters(EMPTY_FILTERS)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 transition-opacity ${isStale ? 'opacity-60' : 'opacity-100'}`}>
              {results.map(f => (
                <FacultyCard
                  key={f.id}
                  faculty={f}
                  overrides={overrides}
                  onClick={setSelected}
                  account={getAccountByFacultyId?.(f.id)}
                  loggedInEmail={loggedInEmail}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
