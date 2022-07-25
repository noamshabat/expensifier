import './App.css';
import { TransactionList } from './components/TransactionList';
import { BarChart } from './components/BarChart';
import { Filters } from './components/Filters';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Views } from './types'
import { useState } from 'react';
import { UndoRedo } from './components/UndoRedo';

function App() {
  const [ view, setView ] = useState<Views>(Views.List)

  const ViewToRender = (view: Views) => {
    switch (view) {
      case Views.List: return <TransactionList />
      case Views.Bar: return <BarChart setView={setView} />
    }
  }

  return (
    <div className="App">
      <UndoRedo view={view} setView={setView} />
      <Filters filters={['month', 'category', 'type', 'origin']} />
      <FormControl>
        <InputLabel id="view-label">View</InputLabel>
        <Select
          labelId="view-label"
          value={view}
          label="View"
          onChange={(e) => setView(e.target.value as Views)}
        >
          <MenuItem value={Views.List}>{Views.List}</MenuItem>
          <MenuItem value={Views.Bar}>{Views.Bar}</MenuItem>
        </Select>
      </FormControl>
      {ViewToRender(view)}
    </div>
  );
}

export default App;
