import { createTheme } from '@mui/material/styles';

const tokens = {
  colors: {
    surface: '#f8f9fb',
    surfaceDim: '#d9dadc',
    surfaceBright: '#f8f9fb',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f4f6',
    surfaceContainer: '#edeef0',
    surfaceContainerHigh: '#e7e8ea',
    surfaceContainerHighest: '#e1e2e4',
    onSurface: '#191c1e',
    onSurfaceVariant: '#434654',
    inverseSurface: '#2e3132',
    inverseOnSurface: '#f0f1f3',
    outline: '#737685',
    outlineVariant: '#c3c6d6',
    surfaceTint: '#0c56d0',
    primary: '#003d9b',
    onPrimary: '#ffffff',
    primaryContainer: '#0052cc',
    onPrimaryContainer: '#c4d2ff',
    inversePrimary: '#b2c5ff',
    secondary: '#006c47',
    onSecondary: '#ffffff',
    secondaryContainer: '#82f9be',
    onSecondaryContainer: '#00734c',
    tertiary: '#5e3c00',
    onTertiary: '#ffffff',
    tertiaryContainer: '#7d5200',
    onTertiaryContainer: '#ffca81',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    background: '#f8f9fb',
    onBackground: '#191c1e',
    surfaceVariant: '#e1e2e4',
    success: '#36B37E',
    warning: '#FFAB00',
  },
  rounded: {
    sm: 4,
    default: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

const interStack = ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'].join(',');
const monoStack = ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', '"Courier New"', 'monospace'].join(',');

export const growPathTheme = createTheme({
  spacing: 4,
  palette: {
    mode: 'light',
    primary: {
      main: tokens.colors.primaryContainer,
      light: tokens.colors.surfaceTint,
      dark: tokens.colors.primary,
      contrastText: tokens.colors.onPrimary,
    },
    secondary: {
      main: tokens.colors.secondary,
      light: tokens.colors.secondaryContainer,
      dark: tokens.colors.onSecondaryContainer,
      contrastText: tokens.colors.onSecondary,
    },
    success: {
      main: tokens.colors.success,
      light: '#7FD8AE',
      dark: '#1A8B5D',
      contrastText: '#ffffff',
    },
    warning: {
      main: tokens.colors.warning,
      light: '#FFCF66',
      dark: '#CC8800',
      contrastText: '#191c1e',
    },
    error: {
      main: tokens.colors.error,
      light: tokens.colors.errorContainer,
      dark: tokens.colors.onErrorContainer,
      contrastText: tokens.colors.onError,
    },
    info: {
      main: tokens.colors.surfaceTint,
      light: '#4C82DF',
      dark: tokens.colors.primary,
      contrastText: '#ffffff',
    },
    background: {
      default: tokens.colors.background,
      paper: tokens.colors.surfaceContainerLowest,
    },
    text: {
      primary: tokens.colors.onSurface,
      secondary: tokens.colors.onSurfaceVariant,
      disabled: tokens.colors.outline,
    },
    divider: tokens.colors.outlineVariant,
    grey: {
      50: tokens.colors.surfaceContainerLowest,
      100: tokens.colors.surfaceContainerLow,
      200: tokens.colors.surfaceContainer,
      300: tokens.colors.surfaceContainerHigh,
      400: tokens.colors.surfaceContainerHighest,
      500: tokens.colors.outlineVariant,
      600: tokens.colors.outline,
      700: tokens.colors.onSurfaceVariant,
      800: tokens.colors.inverseSurface,
      900: tokens.colors.onSurface,
    },
  },
  typography: {
    fontFamily: interStack,
    h1: {
      fontFamily: interStack,
      fontSize: '30px',
      fontWeight: 700,
      lineHeight: '38px',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: interStack,
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '32px',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: interStack,
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '28px',
    },
    h4: {
      fontFamily: interStack,
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '26px',
    },
    h5: {
      fontFamily: interStack,
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '24px',
    },
    h6: {
      fontFamily: interStack,
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
    },
    body1: {
      fontFamily: interStack,
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
    },
    body2: {
      fontFamily: interStack,
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
    button: {
      fontFamily: interStack,
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
      textTransform: 'none',
    },
    caption: {
      fontFamily: interStack,
      fontSize: '12px',
      fontWeight: 700,
      lineHeight: '16px',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    overline: {
      fontFamily: monoStack,
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: tokens.rounded.default,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.colors.background,
          color: tokens.colors.onBackground,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.rounded.default,
          backgroundColor: tokens.colors.surfaceContainerLowest,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${tokens.colors.outlineVariant}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: tokens.rounded.default,
          backgroundColor: tokens.colors.surfaceContainerLowest,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: tokens.rounded.default,
          paddingInline: '16px',
          minHeight: 40,
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: tokens.colors.primaryContainer,
          color: tokens.colors.onPrimary,
          '&:hover': {
            backgroundColor: tokens.colors.primary,
          },
        },
        outlinedPrimary: {
          borderColor: tokens.colors.primaryContainer,
          color: tokens.colors.primaryContainer,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.rounded.full,
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.rounded.default,
          backgroundColor: tokens.colors.surfaceContainerLowest,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.colors.outlineVariant,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.colors.outline,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: tokens.colors.primaryContainer,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: tokens.rounded.full,
          height: 6,
        },
      },
    },
  },
});

export const customColors = {
  rating: {
    high: '#36B37E',
    medium: '#FFAB00',
    low: '#BA1A1A',
  },
  experience: {
    beginner: '#4C82DF',
    intermediate: '#FFAB00',
    advanced: '#36B37E',
  },
};

export const designTokens = tokens;


