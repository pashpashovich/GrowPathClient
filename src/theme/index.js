import { createTheme } from '@mui/material/styles';

export const growPathTheme = createTheme({
  palette: {
    primary: {
      main: '#1A7AE0',
      light: '#92C0FA',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#31F0A4',
      light: '#99E6D8',
      dark: '#2DD4A0',
      contrastText: '#212121',
    },
    success: {
      main: '#31F0A4',
      light: '#99E6D8',
      dark: '#2DD4A0',
    },
    error: {
      main: '#FF5252',
      light: '#FFCDD2',
      dark: '#E53935',
    },
    warning: {
      main: '#FFC107',
      light: '#FFF176',
      dark: '#FF8F00',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    background: {
      default: '#F6F7F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9E9E9E',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    rating: {
      high: '#31F0A4',
      medium: '#FFC107',
      low: '#FF5252',
    },
    experience: {
      beginner: '#92C0FA',
      intermediate: '#FF9800',
      advanced: '#31F0A4',
    },
  },
  typography: {
    fontFamily: [
      'Source Sans Pro',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: '30px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 122, 224, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 6px rgba(26, 122, 224, 0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 122, 224, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#F6F7F9',
            '&:hover': {
              backgroundColor: '#FFFFFF',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 0 3px rgba(26, 122, 224, 0.1)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
  },
});

export const customColors = {
  rating: {
    high: '#31F0A4',
    medium: '#FFC107',
    low: '#FF5252',
  },
  experience: {
    beginner: '#92C0FA',
    intermediate: '#FF9800',
    advanced: '#31F0A4',
  },
};


