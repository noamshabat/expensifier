import { Box } from "@mui/material"
import { useAppContext } from "../AppContext"
import { Filterable, Transaction } from "../types"
import { GenericFilter } from "./GenericFilter"

type FiltersProps = {
    filters: Array<keyof Partial<Transaction>>
}

export function GenericFilterWrapper(props: { name: keyof Transaction }) {
    const context = useAppContext()
    const names = context[`${props.name}Names` as keyof typeof context]

    const setFilter = (newFilter: Filterable[]) => {
        context.setFilters({ [props.name]: newFilter})
    }

    return <GenericFilter 
                filterName={props.name} 
                names={names as Filterable[]} 
                filtered={context.filters[props.name] as Filterable[] || []}
                setFilter={setFilter} 
            />
}

export function Filters(props: FiltersProps) {
    return <Box sx={{display: 'flex'}}>
        {props.filters.map((f) => <GenericFilterWrapper key={f} name={f} />)}
    </Box>
    
}