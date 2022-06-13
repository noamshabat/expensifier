import './App.css';
import { TransactionList } from './components/TransactionList';
import { BarChart } from './components/BarChart';
import { PieChart } from './components/PieChart';
import { Filters } from './components/Filters';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Views } from './types'
import { useAppContext } from './AppContext';

const ViewComponents = {
  [Views.List]: TransactionList,
  [Views.Bar]: BarChart,
  [Views.CategoryPie]: PieChart,
}

function App() {
  const { view, setView } = useAppContext()
  const ViewToRender = ViewComponents[view]

  return (
    <div className="App">
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
          <MenuItem value={Views.CategoryPie}>{Views.CategoryPie}</MenuItem>
        </Select>
      </FormControl>
      <ViewToRender />
    </div>
  );
}

export default App;
