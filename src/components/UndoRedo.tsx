import { Button, Stack } from "@mui/material";
import { isEqual } from "underscore"
import { useEffect, useState } from "react";
import { FiltersDesc, useFilters } from "../context/FiltersContext";
import { Views } from "../types";

// we don't want to immediately add an undo call after something changes since sometimes several things change at the same time in succession.
// wait a bit so that we can get a full state.
const SET_UNDO_TIMEOUT = 500

type HistoryStateItem = {
    filters: FiltersDesc;
    view: Views;
}

export function UndoRedo(p: { view: Views, setView: (v: Views) => void }) {
    const { filters, setFilters } = useFilters()
    const [timeoutHandler, setTimeoutHandler] = useState<null|number>(null)
    const [history, setHistory] = useState<HistoryStateItem[]>([])
    const [index, setIndex] = useState(-1)

    // when filters or view change, we want to add an undo action.
    useEffect(() => {
        // if several things changed in succession we already have an active timeout handler. remove it.
        if (timeoutHandler) clearTimeout(timeoutHandler)
        // add a timeout handler to wait a while before setting the new history index.
        setTimeoutHandler(window.setTimeout(() => {
            if (isEqualState(history[index])) return

            // first clear the timeout handler.
            setTimeoutHandler(null)
            
            // set new history (need to slice in case we did any undo operations)
            const newHistory = history.slice(0, index + 1)
            newHistory.push({ view: p.view, filters: {...filters} })
            setHistory(newHistory)

            // set the new current index
            setIndex(index+1)
        }, SET_UNDO_TIMEOUT))
    }, [filters, p.view] )

    const isEqualState = (item: HistoryStateItem) => {
        if (!item) return false
        if (item.view !== p.view) return false
        return isEqual(item.filters, filters)
    }

    const setHistoryItem = (tIndex: number) => {
        const item = history[tIndex]
        setIndex(tIndex)
        p.setView(item.view)
        const newFilters = {
            // the reduce function is required in case the last item contains less filter types than the current filter.
            ...Object.keys(filters).reduce<FiltersDesc>((desc, filterKey) => {
                desc[filterKey as keyof FiltersDesc] = item.filters[filterKey as keyof FiltersDesc] || []
                return desc
            }, {}),
            ...item.filters
        }
        setFilters(newFilters)
    }
    const undo = () => { if (index > 0) setHistoryItem(index - 1) }
    const redo = () => { if (index < history.length - 1) setHistoryItem(index + 1) }

    return <Stack direction="row" gap="8px">
        <Button variant="contained" onClick={undo}>Undo</Button>
        <Button variant="contained" onClick={redo}>Redo</Button>
    </Stack>
}
