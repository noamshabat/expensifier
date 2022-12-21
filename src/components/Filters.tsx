import Stack from '@mui/material/Stack'
import { Facets, useFacets } from '../hooks/useFacets'
import { useFilters } from '../context/FiltersContext'
import { Filterable } from '../types'
import { Transaction } from 'expensifier-logic/shared.types';
import { GenericFilter } from './GenericFilter'
import { InputBaseProps, TextField } from '@mui/material'

type FiltersProps = {
	filters: Array<keyof Partial<Transaction>>
}

const FacetColors: {[key in keyof Facets]?: InputBaseProps['color']} = {
	category: 'primary',
	category2: 'secondary',
	category3: 'warning',
	category4: 'success',
}

export function GenericFilterWrapper(props: { name: keyof Transaction, facets: Facets, loading: boolean }) {
	const { filters, setFilters } = useFilters()
	const names = props.facets[props.name as keyof Facets] || []

	const setFilter = (newFilter: Filterable[]) => {
		setFilters({ [props.name]: newFilter})
	}

	return <GenericFilter 
		filterName={props.name} 
		names={names as Filterable[]} 
		filtered={filters[props.name] as Filterable[] || []}
		setFilter={setFilter} 
		loading={props.loading}
		color={FacetColors[props.name as keyof typeof FacetColors] || undefined}
	/>
}

export function SearchFilter() {
	const { filters, setFilters } = useFilters()

	return <TextField 
		size="small"
		placeholder="Search description"
		value={filters.description && filters.description[0] || ''}
		onChange={(e) => setFilters({ description: [e.target.value]})}
		label="description"
	/>
}

export function Filters(props: FiltersProps) {
	const { facets, loading } = useFacets()
	
	return <Stack direction='row' flexWrap={'wrap'} alignItems="center" gap={1}>
		{props.filters.map((f) => <GenericFilterWrapper key={f} name={f} facets={facets} loading={loading} />)}
		<SearchFilter />
	</Stack>   
}