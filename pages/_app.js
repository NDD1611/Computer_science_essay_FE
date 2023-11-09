import '../styles/style.css'
import '../styles/globals.css'
import '@mantine/core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import '../node_modules/@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import store from '../redux/store'
import { Provider } from 'react-redux'
import { MantineProvider, createTheme } from '@mantine/core';
import React from 'react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const theme = createTheme({
    /** Put your mantine theme override here */
});
// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    return <Provider store={store}>
        <MantineProvider theme={theme}>
            <Component {...pageProps} />
            <ToastContainer />
        </MantineProvider>
    </Provider>
}

