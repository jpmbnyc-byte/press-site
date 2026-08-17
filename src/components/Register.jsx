import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/lib/hwTheme';
import { EDITORIAL_COLORS, formatRegisterCoordinate, getSeriesMeta } from '@/lib/editorialSystem';

const RegisterContext = createContext(null);

const EMPTY_ENTRY = {
  pathname: '',
  seriesName: 'Human Weather',
  seriesOrder: null,
  essayOrder: null,
  essayTotal: null,
  reference: '',
  year: String(new Date().getFullYear()),
  color: EDITORIAL_COLORS.ink,
};

export function RegisterProvider({ children }) {
  const location = useLocation();
  const [entry, setEntryState] = useState(EMPTY_ENTRY);
  const [progress, setProgress] = useState(0);

  const setRegister = useCallback((next = {}) => {
    const seriesName = next.seriesName || 'Human Weather';
    const system = getSeriesMeta(seriesName);
    setEntryState({
      ...EMPTY_ENTRY,
      ...next,
      pathname: next.pathname || window.location.pathname,
      seriesName,
      seriesOrder: next.seriesOrder || system.order,
      color: next.color || system.color,
    });
  }, []);

  useEffect(() => {
    setProgress(0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const next = available > 0 ? Math.min(window.scrollY / available, 1) : 0;
      setProgress(next);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const value = useMemo(() => ({ setRegister }), [setRegister]);
  const visibleEntry = entry.pathname === location.pathname ? entry : EMPTY_ENTRY;

  return (
    <RegisterContext.Provider value={value}>
      <Register entry={visibleEntry} progress={progress} />
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const context = useContext(RegisterContext);
  if (!context) throw new Error('useRegister must be used inside RegisterProvider');
  return context;
}

function Register({ entry, progress }) {
  const { mode } = useTheme();
  const series = formatRegisterCoordinate(entry.seriesOrder);
  const essay = formatRegisterCoordinate(entry.essayOrder);
  const total = formatRegisterCoordinate(entry.essayTotal);
  const essayLabel = essay ? `E${essay}${total ? `/${total}` : ''}` : 'INDEX';
  const seriesLabel = series ? `S${series}` : 'HW';
  const registerInk = mode === 'night' ? 'var(--hw-ink)' : entry.color;

  return (
    <>
      <aside
        className="hw-register fixed left-0 top-14 bottom-0 z-40 hidden w-14 border-r lg:flex lg:flex-col"
        style={{ '--register-ink': registerInk }}
        aria-label="Publication register"
      >
        <div className="px-3 py-5">
          <div>{seriesLabel}</div>
          <div className="mt-1">{essayLabel}</div>
        </div>
        <div className="px-3 text-[var(--hw-muted)] break-words leading-[1.35]">
          {entry.reference || entry.seriesName}
        </div>
        <div className="mx-3 my-5 flex-1 border-l border-[var(--hw-rule)] relative" aria-hidden="true">
          <div
            className="absolute left-[-1px] top-0 w-px bg-[var(--register-ink)]"
            style={{ height: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="px-3 pb-5 text-[var(--hw-muted)]">{entry.year}</div>
      </aside>

      <div
        className="hw-register fixed left-0 right-0 top-14 z-40 flex h-8 items-center border-b bg-[var(--hw-paper)] px-4 lg:hidden"
        style={{ '--register-ink': registerInk }}
        aria-label="Publication register"
      >
        <span>{seriesLabel}</span>
        <span className="mx-2 text-[var(--hw-muted)]">·</span>
        <span>{essayLabel}</span>
        <span className="ml-3 truncate text-[var(--hw-muted)]">{entry.seriesName}</span>
        <span className="ml-auto text-[var(--hw-muted)]">{entry.year}</span>
        <span className="absolute bottom-[-1px] left-0 h-px bg-[var(--register-ink)]" style={{ width: `${Math.round(progress * 100)}%` }} aria-hidden="true" />
      </div>
    </>
  );
}
