import React from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { TransactionsContext } from './context/TransactionsContext';
import { FacetsContext } from './context/FacetsContext';
import { MappingsContext } from './context/MappingsContext';
import { FiltersContext } from './context/FiltersContext';

async function start() {
  render(
    <React.StrictMode>
      <FiltersContext>
        <FacetsContext>
          <TransactionsContext>
            <MappingsContext>
              <App />
            </MappingsContext>
          </TransactionsContext>
        </FacetsContext>
      </FiltersContext>
    </React.StrictMode>
  , document.getElementById('root') as HTMLElement);
  
  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
  
}
start()
