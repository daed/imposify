import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import Main from './Main';
import About from './About';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';


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
