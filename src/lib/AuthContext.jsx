import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

const PUBLIC_SETTINGS_TIMEOUT_MS = 8000;

function clearStoredAuthTokens() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem('base44_access_token');
    window.localStorage.removeItem('token');
  } catch {
    /* ignore */
  }
}

function withTimeout(promise, ms, label = 'Request timed out') {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const finishAnonymous = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
    setAuthChecked(true);
  };

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const publicApiBase = appParams.appBaseUrl
        ? `${String(appParams.appBaseUrl).replace(/\/$/, '')}/api/apps/public`
        : '/api/apps/public';

      const appClient = createAxiosClient({
        baseURL: publicApiBase,
        headers: {
          'X-App-Id': appParams.appId,
        },
        token: appParams.token,
        interceptResponses: true,
      });

      try {
        const publicSettings = await withTimeout(
          appClient.get(`/prod/public-settings/by-id/${appParams.appId}`),
          PUBLIC_SETTINGS_TIMEOUT_MS,
          'Public settings timed out'
        );
        setAppPublicSettings(publicSettings);

        // Press site is public — never hard-block on auth. Optional token only.
        if (appParams.token) {
          await checkUserAuth({ clearOnFailure: true });
        } else {
          finishAnonymous();
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);

        // Public press site: never redirect into Base44 login from Vercel.
        // Clear bad tokens and continue rendering the journal.
        clearStoredAuthTokens();
        setAuthError({
          type: 'unknown',
          message: appError.message || 'Failed to load app settings',
        });
        finishAnonymous();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      clearStoredAuthTokens();
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
      });
      finishAnonymous();
    }
  };

  const checkUserAuth = async ({ clearOnFailure = true } = {}) => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await withTimeout(
        base44.auth.me(),
        PUBLIC_SETTINGS_TIMEOUT_MS,
        'Auth check timed out'
      );
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      if (clearOnFailure) {
        clearStoredAuthTokens();
      }
      // Do not set auth_required — that previously triggered an infinite
      // login redirect loop and a blank page on Vercel.
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = false) => {
    setUser(null);
    setIsAuthenticated(false);
    clearStoredAuthTokens();

    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    }
  };

  const navigateToLogin = () => {
    // Intentionally no-op for the public press site so we never leave
    // humanweather.vercel.app for a Base44 login redirect loop.
    console.warn('Login redirect suppressed on public press site');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
