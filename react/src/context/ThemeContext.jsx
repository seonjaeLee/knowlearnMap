import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  KL_THEME_MODE_STORAGE_KEY,
  THEME_MODES,
  applyDocumentTheme,
  isAuthRoutePath,
  isThemeModeSelectable,
  readStoredThemeMode,
  resolveThemeFromMode,
} from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const location = useLocation();
  const [themeMode, setThemeModeState] = useState(readStoredThemeMode);

  const isAuthRoute = isAuthRoutePath(location.pathname);

  const resolvedTheme = useMemo(() => {
    if (isAuthRoute) return THEME_MODES.LIGHT;
    return resolveThemeFromMode(themeMode);
  }, [isAuthRoute, themeMode]);

  const setThemeMode = useCallback((mode) => {
    if (!isThemeModeSelectable(mode)) {
      return;
    }
    setThemeModeState(mode);
    try {
      localStorage.setItem(KL_THEME_MODE_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyDocumentTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (themeMode !== THEME_MODES.SYSTEM || isAuthRoute) return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyDocumentTheme(resolveThemeFromMode(THEME_MODES.SYSTEM));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themeMode, isAuthRoute]);

  const value = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
      isAuthRoute,
    }),
    [themeMode, resolvedTheme, setThemeMode, isAuthRoute],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
