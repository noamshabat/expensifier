import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Filterable } from '../types';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from "@material-ui/core/styles";

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

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    width: 300
  },
  indeterminateColor: {
    color: "#f50057"
  },
  selectAllText: {
    fontWeight: 500
  },
  selectedAll: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)"
    }
  }
}));

type FilterProps<T> = {
  filterName: string
  filtered: T[]
  setFilter: (newFilters: T[]) => void
  names: T[]
}
export function GenericFilter<T extends Filterable>(props: FilterProps<T>) {
    const classes = useStyles();

    const isAllSelected = props.names.length > 0 && props.filtered.length === props.names.length;
  
    const handleChange = (event: SelectChangeEvent<Filterable[]>) => {
      const value = event.target.value;
      if (value[value.length - 1] === "all") {
        props.setFilter(props.filtered.length === props.names.length ? [] : props.names);
        return
      }
      props.setFilter(event.target.value as T[]);
    };

    return <div>
        <FormControl sx={{ m: 1, width: 300 }} variant="outlined">
        <InputLabel>{props.filterName}</InputLabel>
        <Select
          id={`${props.filterName}-filter`}
          label={props.filterName}
          multiple
          value={props.filtered}
          onChange={handleChange}
          renderValue={(selected: Filterable[]) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value.toString()} label={value.toString()} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          <MenuItem
            value="all"
            classes={{
              root: isAllSelected ? classes.selectedAll : ""
            }}
          >
            <ListItemIcon>
            <Checkbox
              classes={{ indeterminate: classes.indeterminateColor }}
              checked={isAllSelected}
              indeterminate={
                props.filtered.length > 0 && props.filtered.length < props.names.length
              }
            />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.selectAllText }}
              primary="Select All"
            />
          </MenuItem>
          {props.names.map((option: Filterable) => (
            <MenuItem key={option} value={option}>
            <ListItemIcon>
              <Checkbox checked={props.filtered.indexOf(option as T) > -1} />
            </ListItemIcon>
            <ListItemText primary={option} />
          </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
}
