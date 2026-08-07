import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { SITE_URL } from '@/lib/site';
import { isSafeReturnUrl } from '@/lib/authRedirect';
import {
  clearStoredAuthTokens,
  hasStoredAuthToken,
  storeAuthToken,
  buildAuthPath,
} from '@/lib/authSession';

const AuthContext = createContext();

const PUBLIC_SETTINGS_TIMEOUT_MS = 8000;

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
      },
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

      // Base44-hosted OAuth bridge: only forward a token present in the URL
      // (never a stale localStorage session — that breaks alternate accounts).
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const onBase44Host = host === 'humanweather.base44.app' || host.endsWith('.base44.app');
        if (onBase44Host) {
          const params = new URLSearchParams(window.location.search);
          const next = params.get('next') || `${SITE_URL}/account`;
          if (params.get('start_google') === '1' && isSafeReturnUrl(next)) {
            const returnTo = new URL('/auth/bridge', window.location.origin);
            returnTo.searchParams.set('next', next);
            base44.auth.loginWithProvider('google', returnTo.toString());
            return;
          }
          const urlToken = params.get('access_token');
          if (urlToken && params.get('next') && isSafeReturnUrl(next)) {
            const dest = new URL(next);
            dest.searchParams.set('access_token', urlToken);
            window.location.replace(dest.toString());
            return;
          }
        }
      }

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
          'Public settings timed out',
        );
        setAppPublicSettings(publicSettings);
        await checkUserAuth({ clearOnFailure: true });
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);
        // Do not wipe a valid session when public-settings alone fails.
        setAuthError({
          type: 'unknown',
          message: appError.message || 'Failed to load app settings',
        });
        await checkUserAuth({ clearOnFailure: false });
        setIsLoadingPublicSettings(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
      if (!hasStoredAuthToken() && !appParams.token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }
      const currentUser = await withTimeout(
        base44.auth.me(),
        PUBLIC_SETTINGS_TIMEOUT_MS,
        'Auth check timed out',
      );
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      if (clearOnFailure) {
        clearStoredAuthTokens();
        if (typeof window !== 'undefined') window.__hw_auth_cleared = true;
      }
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const login = (nextUser, token) => {
    if (token) storeAuthToken(token);
    if (nextUser) {
      setUser(nextUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  /**
   * @param {object|boolean} [opts]
   * @param {boolean} [opts.serverLogout] — also clear Base44 cookies (needed to switch Google accounts)
   * @param {string} [opts.next] — path to return to after logging in again
   */
  const logout = (opts = {}) => {
    const options = typeof opts === 'boolean' ? { serverLogout: opts } : opts || {};
    const next = options.next || '/account';

    setUser(null);
    setIsAuthenticated(false);
    clearStoredAuthTokens();
    if (typeof window !== 'undefined') window.__hw_auth_cleared = true;

    const loginPath = buildAuthPath('login', { next });
    const loginUrl = `${SITE_URL}${loginPath}`;

    if (options.serverLogout) {
      // Full Base44 logout clears HTTP-only cookies so Google can pick another account.
      base44.auth.logout(loginUrl);
      return;
    }

    // Full reload so the SDK re-inits without a Bearer token in memory.
    window.location.replace(loginPath);
  };

  const navigateToLogin = (nextPath) => {
    const next = nextPath || `${window.location.pathname}${window.location.search}`;
    window.location.href = buildAuthPath('login', { next });
  };

  const refreshUser = async () => {
    if (!hasStoredAuthToken() && !appParams.token) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      clearStoredAuthTokens();
      if (typeof window !== 'undefined') window.__hw_auth_cleared = true;
      return null;
    }
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
        login,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
        refreshUser,
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
