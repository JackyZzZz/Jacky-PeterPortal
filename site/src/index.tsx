import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './index.css';

// Import Global Store
import { store } from './store/store';
import { Provider } from 'react-redux';

// Create a Client
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import axios from 'axios';
if (process.env.NODE_ENV == 'production') {
  // Redirect relative url to api url on production
  axios.defaults.baseURL = 'https://8di904abhb.execute-api.us-east-1.amazonaws.com/prod';
}

const client = new ApolloClient({
  uri: '/graphql/',
  cache: new InMemoryCache()
});

/**
 * Render App
 */

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)