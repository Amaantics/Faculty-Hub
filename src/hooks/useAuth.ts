import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'faculty_hub_auth_v2';

interface AuthState {
  loggedInEmail: string | null;
}

const INITIAL: AuthState = { loggedInEmail: null };

export function useAuth() {
  const [auth, setAuth] = useLocalStorage<AuthState>(STORAGE_KEY, INITIAL);

  const login = (email: string): void => {
    setAuth({ loggedInEmail: email.toLowerCase().trim() });
  };

  const logout = (): void => {
    setAuth({ loggedInEmail: null });
  };

  const isLoggedIn = auth.loggedInEmail !== null;

  return {
    loggedInEmail: auth.loggedInEmail,
    isLoggedIn,
    login,
    logout,
  };
}
