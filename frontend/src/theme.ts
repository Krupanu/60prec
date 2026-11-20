import { createTheme } from '@mui/material/styles';

// Фирменная цветовая схема (см. PROJECT_SPEC.md):
// Sapphire #3C5070, Royal Blue #112250, Quicksand #E0C58F,
// Swan Wing #F5F0E9, Shellstone #D9CBC2
const theme = createTheme({
  palette: {
    primary: {
      main: '#3C5070',
      contrastText: '#F5F0E9',
    },
    secondary: {
      main: '#112250',
      contrastText: '#E0C58F',
    },
    background: {
      default: '#F5F0E9',
      paper: '#FFFFFF',
    },
    divider: '#D9CBC2',
    text: {
      primary: '#112250',
      secondary: '#3C5070',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", Arial, sans-serif',
    h4: { fontWeight: 700, color: '#112250' },
    h5: { fontWeight: 600, color: '#112250' },
    h6: { fontWeight: 600, color: '#112250' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#112250' },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': { backgroundColor: '#112250' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #D9CBC2' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F5F0E9',
            fontWeight: 700,
            color: '#112250',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

// Акцентный цвет Quicksand — используется точечно (ценники, рейтинг, иконки)
export const ACCENT = '#E0C58F';

export default theme;
