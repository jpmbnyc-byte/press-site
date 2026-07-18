import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hw-mode') || 'day';
    }
    return 'day';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    try { localStorage.setItem('hw-mode', mode); } catch(e) {}
  }, [mode]);

  const toggle = () => setMode(m => m === 'day' ? 'night' : 'day');

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}