import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '../../context/ThemeContext';

export default function MuiThemeBridge({ children }) {
  const { resolvedTheme } = useTheme();

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: resolvedTheme === 'dark' ? 'dark' : 'light',
        primary: {
          main: '#1a73e8',
          dark: '#1557b0',
        },
        background: {
          default: resolvedTheme === 'dark' ? '#0f172a' : '#f8f9fa',
          paper: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
        },
      },
      typography: {
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
      },
    }),
    [resolvedTheme],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
