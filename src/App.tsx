import './App.css';
import { useState } from 'react'
import { TransactionList } from './components/TransactionList';
import { Filters } from './components/Filters';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const enum Views {
  List='List'
}

function App() {

  const [view, setView] = useState<Views>(Views.List)

  return (
    <div className="App">
      <Filters filters={['month', 'category']} />
      <FormControl>
        <InputLabel id="view-label">View</InputLabel>
        <Select
          labelId="view-label"
          value={view}
          label="View"
          onChange={(e) => setView(e.target.value as Views)}
        >
          <MenuItem value={Views.List}>{Views.List}</MenuItem>
        </Select>
      </FormControl>
      <TransactionList />
    </div>
  );
}

export default App;
