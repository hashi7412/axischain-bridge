import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Provider } from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import Slice from './reducer'

const store = configureStore({reducer: Slice.reducer});

require('dotenv').config();
ReactDOM.render(
	<Provider store={store}><App /></Provider>, document.getElementById("root"));

reportWebVitals();
