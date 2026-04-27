import { X } from 'lucide-react';
import { FLOORS_ORDERED, BLOCKS_BY_FLOOR, FLOOR_LABELS } from '../utils/floorUtils';
import { REMARK_LABELS, REMARK_CLASSES } from '../utils/remarkClassifier';
import { STATUS_CONFIG } from '../utils/statusUtils';
import type { FilterState, FloorKey, BlockCode, FacultyStatus, RemarkType } from '../types';

const ACTIVE_REMARK_TYPES: RemarkType[] = [
  'medical_leave', 'maternity_leave', 'on_leave', 'shifted', 'sharing', 'entrepreneurship', 'note',
];

const ALL_STATUSES: FacultyStatus[] = ['available', 'in_class', 'away', 'on_leave'];

interface Props {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  totalResults: number;
  totalFaculty: number;
}

function Toggle({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
        active
          ? `${className ?? 'bg-indigo-600 text-white border-indigo-600'}`
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({ filters, onFiltersChange, totalResults, totalFaculty }: Props) {
  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const setFloors = (f: FloorKey) =>
    onFiltersChange({ ...filters, floors: toggle(filters.floors, f), blocks: [] });

  const setBlock = (b: BlockCode) =>
    onFiltersChange({ ...filters, blocks: toggle(filters.blocks, b) });

  const setStatus = (s: FacultyStatus) =>
    onFiltersChange({ ...filters, statuses: toggle(filters.statuses, s) });

  const setRemark = (r: RemarkType) =>
    onFiltersChange({ ...filters, remarkTypes: toggle(filters.remarkTypes, r) });

  const clearAll = () =>
    onFiltersChange({ searchQuery: filters.searchQuery, floors: [], blocks: [], statuses: [], remarkTypes: [] });

  const hasFilters =
    filters.floors.length > 0 ||
    filters.blocks.length > 0 ||
    filters.statuses.length > 0 ||
    filters.remarkTypes.length > 0;

  // Which blocks to show: if floors selected, show only those blocks
  const visibleBlocks: BlockCode[] =
    filters.floors.length > 0
      ? filters.floors.flatMap(f => BLOCKS_BY_FLOOR[f])
      : Object.values(BLOCKS_BY_FLOOR).flat();

  return (
    <aside className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{totalResults}</span>
          <span> of {totalFaculty} faculty</span>
        </p>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Status */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <Toggle
                key={s}
                active={filters.statuses.includes(s)}
                onClick={() => setStatus(s)}
                className={`${cfg.btnClasses} border-transparent`}
              >
                {cfg.label}
              </Toggle>
            );
          })}
        </div>
      </div>

      {/* Floor */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Floor</p>
        <div className="flex flex-wrap gap-1.5">
          {FLOORS_ORDERED.map(f => (
            <Toggle
              key={f}
              active={filters.floors.includes(f)}
              onClick={() => setFloors(f)}
            >
              {FLOOR_LABELS[f]}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Block */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Block</p>
        <div className="flex flex-wrap gap-1.5">
          {visibleBlocks.map(b => (
            <Toggle
              key={b}
              active={filters.blocks.includes(b)}
              onClick={() => setBlock(b)}
            >
              {b}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Remark */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Special</p>
        <div className="flex flex-wrap gap-1.5">
          {ACTIVE_REMARK_TYPES.map(r => (
            <Toggle
              key={r}
              active={filters.remarkTypes.includes(r)}
              onClick={() => setRemark(r)}
              className={`${REMARK_CLASSES[r]} border border-current`}
            >
              {REMARK_LABELS[r]}
            </Toggle>
          ))}
        </div>
      </div>
    </aside>
  );
}
