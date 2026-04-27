import { useLocalStorage } from './useLocalStorage';
import type { FacultyAccount, FacultyAccounts } from '../types';

const STORAGE_KEY = 'faculty_hub_accounts_v2';

export function useFacultyAccounts() {
  const [accounts, setAccounts] = useLocalStorage<FacultyAccounts>(STORAGE_KEY, {});

  /** Create a brand-new account */
  const createAccount = (account: FacultyAccount): void => {
    setAccounts(prev => ({ ...prev, [account.email]: account }));
  };

  /** Update specific fields of an existing account */
  const updateAccount = (
    email: string,
    updates: Partial<Omit<FacultyAccount, 'email' | 'createdAt'>>
  ): void => {
    setAccounts(prev => {
      const existing = prev[email];
      if (!existing) return prev;
      return {
        ...prev,
        [email]: { ...existing, ...updates, updatedAt: new Date().toISOString() },
      };
    });
  };

  /** Delete an account entirely */
  const deleteAccount = (email: string): void => {
    setAccounts(prev => {
      const next = { ...prev };
      delete next[email];
      return next;
    });
  };

  /** Look up an account by email (case-insensitive) */
  const getAccountByEmail = (email: string): FacultyAccount | undefined =>
    accounts[email.toLowerCase().trim()];

  /** Find the account linked to a hardcoded FacultyRecord id */
  const getAccountByFacultyId = (id: number): FacultyAccount | undefined =>
    Object.values(accounts).find(a => a.linkedFacultyId === id);

  /** Verify PIN for a given email */
  const verifyPin = (email: string, pin: string): boolean =>
    accounts[email.toLowerCase().trim()]?.pin === pin;

  /** True if an account with this email already exists */
  const hasAccount = (email: string): boolean =>
    !!accounts[email.toLowerCase().trim()];

  return {
    accounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountByEmail,
    getAccountByFacultyId,
    verifyPin,
    hasAccount,
  };
}
