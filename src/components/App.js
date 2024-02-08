import React from 'react';
import Main from './Main';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';

const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            // Base state with transparent background
            backgroundColor: 'transparent', 
            color: '#90EE90', // Light Green for text
            border: '0px solid #90EE90', // Light Green border
            '&:hover': {
              backgroundColor: 'rgba(144, 238, 144, 0.08)', // Light Green with transparency on hover
              // Increase contrast or change color slightly on hover if needed
            },
            '&:active': {
              backgroundColor: 'rgba(144, 238, 144, 0.2)', // Slightly more opaque on active
            }
          }
        }
      }
    }
  });


export default class App extends React.Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
                <div class="container">
                    <Main />
                </div>
            </ThemeProvider>
        );
    }
}
