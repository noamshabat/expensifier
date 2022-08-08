import React, { useContext, useMemo, useState } from "react"

type UpdateContext = {
    lastUpdate: number,
    notifyUpdateRequired: VoidFunction
}

const Context = React.createContext({ lastUpdate: 0, notifyUpdateRequired: () => { null } } as UpdateContext)

export const UpdateContext: React.FC<React.PropsWithChildren<unknown>> = (props) => {
    const [lastUpdate, setLastUpdate] = useState(0)
    
    const contextValue = useMemo(() => ({
        lastUpdate, 
        notifyUpdateRequired: () => setLastUpdate((new Date()).getTime()),
    }), [lastUpdate])

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>
}

export function useNotifyUpdate() { return useContext(Context) }