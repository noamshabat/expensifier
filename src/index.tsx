import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { FiltersContext } from './context/FiltersContext';
import { MappingContext } from './context/MappingsContext';
import { UpdateContext } from './context/RefetchContext';
import { WorkerApi } from './api/workerApi';

async function start() {
  render(
    <React.StrictMode>
      <UpdateContext>
        <FiltersContext>
          <MappingContext>
            <App />
          </MappingContext>
        </FiltersContext>
      </UpdateContext>
    </React.StrictMode>
    , document.getElementById('root') as HTMLElement);
}
start()

new WorkerApi()