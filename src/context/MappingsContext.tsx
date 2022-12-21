import { CategoryKeys, Mapping } from "expensifier-logic/shared.types"
import { useMemo, createContext, useState, useContext, useEffect } from "react"
import API from "../api/"

type MappingContext = { 
    mappings: { category: Mapping[], category2: Mapping[], category3: Mapping[], category4: Mapping[] },
    setMapping: (category: string, rule: string, id: CategoryKeys) => Promise<void>
}
const initial: MappingContext = { mappings: { category: [], category2: [], category3: [], category4: [] }, setMapping: () => Promise.resolve() }
const Context = createContext(initial)

const CategoryKeyToIndex: { [key in CategoryKeys]: number } = { category: 0, category2: 1, category3: 2, category4: 3 }

export const MappingContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const [mappings, setMappings] = useState<MappingContext["mappings"]>(initial.mappings)
    
    useEffect(() => { fetch() }, [])

    const fetch = async () => {
        const res = await API.getMappings()
        setMappings({
            category: res[0],
            category2: res[1],
            category3: res[2],
            category4: res[3],
        })
    }

    const setMappingApi = async (category: string, rule: string, id: CategoryKeys) => {
        await API.addMapping({ mapping:{ categoryName: category, regex: rule }, categoryIndex: CategoryKeyToIndex[id] })
        await fetch()
    }

    const contextValue = useMemo(() =>({
        mappings,
        setMapping: setMappingApi
    }), [mappings])

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>
}

export function useMappings() {
    return useContext(Context)
}
