import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Theme, useTheme } from '@mui/material/styles';
import { Filterable } from '../types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

type FilterProps<T> = {
  filterName: string
  filtered: T[]
  setFilter: (newFilters: T[]) => void
  names: T[]
}
export function GenericFilter<T extends Filterable>(props: FilterProps<T>) {
    const theme = useTheme()

    function getStyles(name: Filterable, filtered: readonly Filterable[], theme: Theme) {
      return {
        fontWeight:
          filtered.indexOf(name) === -1
            ? theme.typography.fontWeightRegular
            : theme.typography.fontWeightMedium,
      };
    }
  
    const handleChange = (event: SelectChangeEvent<Filterable[]>) => {
        props.setFilter(event.target.value as T[]);
    };

    return <div>
        <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id={`${props.filterName}-label`}>{props.filterName}</InputLabel>
        <Select
          labelId={`${props.filterName}-label`}
          id={`${props.filterName}-filter`}
          multiple
          value={props.filtered}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected: Filterable[]) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value.toString()} label={value.toString()} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {props.names.map((name: Filterable) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, props.filtered, theme)}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
}
