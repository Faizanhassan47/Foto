import { createContext, useEffect, useState } from 'react';
import api, { getApiError } from '../api/client';

const TOKEN_KEY = 'Tasveer_Hubs_token';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (!token) {
        if (isMounted) {
          setIsBootstrapping(false);
          setUser(null);
        }
        return;
      }

      try {
        const response = await api.get('/auth/me');

        if (isMounted) {
          setUser(response.data.user);
          setAuthError('');
        }
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY);

        if (isMounted) {
          setToken('');
          setUser(null);
          setAuthError(getApiError(error, 'Your session has expired. Please sign in again.'));
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  function persistSession(session) {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
    setAuthError('');
  }

  async function login(values) {
    const response = await api.post('/auth/login', values);
    persistSession(response.data);
    return response.data.user;
  }

  async function register(values) {
    const response = await api.post('/auth/register', values);
    persistSession(response.data);
    return response.data.user;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
    setAuthError('');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authError,
        isBootstrapping,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
