import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { readBrandColorsFromDocument } from '../../constants/brandTheme';
import { useTheme } from '../../context/ThemeContext';

export default function MuiThemeBridge({ children }) {
  const { resolvedTheme } = useTheme();

  const theme = useMemo(
    () => {
      const brand = readBrandColorsFromDocument();
      return createTheme({
      palette: {
        mode: resolvedTheme === 'dark' ? 'dark' : 'light',
        primary: {
          main: brand.primary,
          dark: brand.primaryHover,
        },
        background: {
          default: resolvedTheme === 'dark' ? '#0f172a' : '#f8f8f8',
          paper: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
        },
      },
      typography: {
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
      },
    });
    },
    [resolvedTheme],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
