import { useLocalStorage } from './useLocalStorage';
import type { FacultyProfile, FacultyProfiles } from '../types';

const STORAGE_KEY = 'faculty_hub_profiles_v1';

export function useFacultyProfiles() {
  const [profiles, setProfiles] = useLocalStorage<FacultyProfiles>(STORAGE_KEY, {});

  /** Create a brand new profile for a faculty member (first-time setup) */
  const createProfile = (facultyId: number, pin: string): void => {
    const now = new Date().toISOString();
    setProfiles(prev => ({
      ...prev,
      [facultyId]: {
        facultyId,
        pin,
        setupAt: now,
        updatedAt: now,
      },
    }));
  };

  /** Update an existing profile's fields */
  const updateProfile = (
    facultyId: number,
    updates: Partial<Pick<FacultyProfile, 'photoDataUrl' | 'email' | 'phone'>>
  ): void => {
    setProfiles(prev => {
      const existing = prev[facultyId];
      if (!existing) return prev;
      return {
        ...prev,
        [facultyId]: {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  /** Returns true if PIN matches */
  const verifyPin = (facultyId: number, pin: string): boolean => {
    return profiles[facultyId]?.pin === pin;
  };

  /** Get profile or undefined */
  const getProfile = (facultyId: number): FacultyProfile | undefined => {
    return profiles[facultyId];
  };

  /** Check if a faculty has ever set up a profile */
  const hasProfile = (facultyId: number): boolean => {
    return !!profiles[facultyId];
  };

  return { profiles, createProfile, updateProfile, verifyPin, getProfile, hasProfile };
}
