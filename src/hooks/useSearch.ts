import { useMemo } from 'react';
import { FACULTY_DATA } from '../data/faculty';
import { getEffectiveStatus } from '../utils/statusUtils';
import type { FilterState, StatusOverrides, FacultyRecord } from '../types';

export function useFilteredFaculty(
  filters: FilterState,
  overrides: StatusOverrides
): FacultyRecord[] {
  return useMemo(() => {
    let result = FACULTY_DATA;

    // Search by name or block
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        f =>
          f.fullName.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.block.toLowerCase().includes(q) ||
          f.cabinPosition.toLowerCase().includes(q)
      );
    }

    // Floor filter
    if (filters.floors.length > 0) {
      result = result.filter(f => filters.floors.includes(f.floor));
    }

    // Block filter
    if (filters.blocks.length > 0) {
      result = result.filter(f => filters.blocks.includes(f.block));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter(f =>
        filters.statuses.includes(getEffectiveStatus(f, overrides))
      );
    }

    // Remark type filter
    if (filters.remarkTypes.length > 0) {
      result = result.filter(f => filters.remarkTypes.includes(f.remarkType));
    }

    return result;
  }, [filters, overrides]);
}

export const EMPTY_FILTERS: FilterState = {
  searchQuery: '',
  floors: [],
  blocks: [],
  statuses: [],
  remarkTypes: [],
};
