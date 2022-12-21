import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Views } from '../types';

export function ViewSelector({ setView, view }: { view: Views, setView: (view: Views) => void }) {
	return <FormControl>
		<InputLabel id="view-label">View</InputLabel>
		<Select
			labelId="view-label"
			value={view}
			label="View"
			onChange={(e) => setView(e.target.value as Views)}
			size="small"
		>
			<MenuItem value={Views.List}>{Views.List}</MenuItem>
			<MenuItem value={Views.Bar}>{Views.Bar}</MenuItem>
		</Select>
	</FormControl>
}