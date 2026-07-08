import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import Main from './Main';
import About from './About';
import { AppProvider } from '../context/AppContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const GREEN = '#90EE90';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#333333',
      paper: '#3d3d3d',
    },
    text: {
      primary: '#dddddd',
    },
    primary: {
      main: GREEN,
    },
    action: {
      disabledBackground: '#888888',
      disabled: '#888888',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
          backgroundColor: 'transparent',
          color: GREEN,
          border: `1px solid rgba(144, 238, 144, 0.35)`,
          '&:hover': {
            backgroundColor: 'rgba(144, 238, 144, 0.08)',
            borderColor: GREEN,
          },
          '&:active': {
            backgroundColor: 'rgba(144, 238, 144, 0.2)',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: GREEN,
          borderColor: 'rgba(144, 238, 144, 0.35)',
          '&:hover': {
            backgroundColor: 'rgba(144, 238, 144, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(144, 238, 144, 0.2)',
            color: GREEN,
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(144, 238, 144, 0.28)',
          },
        },
      },
    },
  },
});


export default class App extends React.Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
            <Router basename="/">
              <Routes>
                <Route path="/" element={
                  <AppProvider>
                    <div className="container">
                      <Main />
                    </div>
                  </AppProvider>
                  } />
                <Route path="/about" element={<About />} />
              </Routes>
            </Router>
            </ThemeProvider>
        );
    }
}
