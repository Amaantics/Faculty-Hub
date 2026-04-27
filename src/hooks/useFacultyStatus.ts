import { useLocalStorage } from './useLocalStorage';
import type { FacultyStatus, StatusOverrides } from '../types';

const STORAGE_KEY = 'faculty_hub_status_overrides_v1';

export function useFacultyStatus() {
  const [overrides, setOverrides] = useLocalStorage<StatusOverrides>(STORAGE_KEY, {});

  const setStatus = (facultyId: number, status: FacultyStatus, note?: string) => {
    setOverrides(prev => ({
      ...prev,
      [facultyId]: {
        status,
        updatedAt: new Date().toISOString(),
        note,
      },
    }));
  };

  const clearStatus = (facultyId: number) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[facultyId];
      return next;
    });
  };

  const clearAll = () => setOverrides({});

  const overrideCount = Object.keys(overrides).length;

  return { overrides, setStatus, clearStatus, clearAll, overrideCount };
}
