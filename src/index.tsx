import React from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppContext } from './AppContext';
import { FacetsContext } from './context/FacetsContext';
import { MappingsContext } from './context/MappingsContext';


async function start() {
  render(
    <React.StrictMode>
      <FacetsContext>
        <AppContext>
          <MappingsContext>
            <App />
          </MappingsContext>
        </AppContext>
      </FacetsContext>
    </React.StrictMode>
  , document.getElementById('root') as HTMLElement);
  
  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
  
}
start()
