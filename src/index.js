import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';

import './assets/css/nucleo-icons.css';
import './assets/scss/black-dashboard-pro-react.scss';
import '@repay/react-credit-card/dist/react-credit-card.css';
import 'react-notification-alert/dist/animate.css';

import App from './App';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { purple, red } from '@material-ui/core/colors';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const theme = createTheme( {
    palette: {
        primary: purple, // Purple and green play nicely together.
        error: red,
    },
} );

ReactDOM.render(
    <Auth0Provider
        domain={process.env.REACT_APP_AUTH0_DOMAIN}
        clientId={process.env.REACT_APP_AUTH_CLIENT_ID}
        audience={process.env.REACT_APP_AUTH_AUDIENCE} // taken from your API in Auth0
        redirectUri={process.env.REACT_APP_REDIRECT_URL}
        useRefreshTokens={true}
    >
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline/>
                <DndProvider backend={HTML5Backend}>
                    <App/>
                </DndProvider>
            </ThemeProvider>
    </Auth0Provider>
    ,
    document.getElementById( 'root' )
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();