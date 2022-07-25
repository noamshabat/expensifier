import { Box } from "@mui/material"
import { useFacets } from "../context/FacetsContext"
import { useFilters } from "../context/FiltersContext"
import { Filterable, Transaction } from "../types"
import { GenericFilter } from "./GenericFilter"

type FiltersProps = {
    filters: Array<keyof Partial<Transaction>>
}

export function GenericFilterWrapper(props: { name: keyof Transaction }) {
    const { facets } = useFacets()
    const { filters, setFilters } = useFilters()
    const names = facets[props.name as keyof typeof facets]

    const setFilter = (newFilter: Filterable[]) => {
        setFilters({ [props.name]: newFilter})
    }

    return <GenericFilter 
                filterName={props.name} 
                names={names as Filterable[]} 
                filtered={filters[props.name] as Filterable[] || []}
                setFilter={setFilter} 
            />
}

export function Filters(props: FiltersProps) {
    return <Box sx={{display: 'flex'}}>
        {props.filters.map((f) => <GenericFilterWrapper key={f} name={f} />)}
    </Box>   
}