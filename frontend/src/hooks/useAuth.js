import { useCallback, useState } from "react";

const TOKEN_KEY = "hysacam_token";
const USER_KEY = "hysacam_user";

/**
 * Persistance simple en localStorage : suffisant pour une PWA qui doit rester
 * connectée hors-ligne. Si un jour la sensibilité des données l'exige,
 * envisager un cookie httpOnly émis par le backend à la place.
 */
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, isAuthenticated: Boolean(token), login, logout };
}
