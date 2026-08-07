import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

function syncDocumentChrome(mode) {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-mode', mode);

  const faviconHref = mode === 'night' ? '/favicon-night.png' : '/favicon-day.png';
  let iconLink = document.querySelector('link[rel="icon"][data-hw-theme="true"]');
  if (!iconLink) {
    iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = 'image/png';
    iconLink.setAttribute('data-hw-theme', 'true');
    document.head.appendChild(iconLink);
  }
  iconLink.href = faviconHref;

  const themeColor = mode === 'night' ? '#000000' : '#F7F4EE';
  let themeMeta = document.querySelector('meta[name="theme-color"][data-hw-theme="true"]');
  if (!themeMeta) {
    themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    themeMeta.setAttribute('data-hw-theme', 'true');
    document.head.appendChild(themeMeta);
  }
  themeMeta.content = themeColor;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hw-mode') || 'day';
    }
    return 'day';
  });

  useEffect(() => {
    try { localStorage.setItem('hw-mode', mode); } catch (e) { /* ignore */ }
    syncDocumentChrome(mode);
  }, [mode]);

  const toggle = () => setMode(m => (m === 'day' ? 'night' : 'day'));

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
