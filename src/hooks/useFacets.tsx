import { useEffect, useState } from 'react'
import API from '../api/'
import { useFilters } from '../context/FiltersContext'
import { useNotifyUpdate } from '../context/RefetchContext'


export type Facets = {
	category: string[]
	category2: string[]
	category3: string[]
	category4: string[]
	month: string[]
	accountType: string[]
	type: string[]
	origin: string[]
}

type UseFacets = {
	facets: Facets
	filteredFacets: Facets
	fetchFacets: () => void
	loading: boolean
}

const emptyFacets = {
	category: [],
	category2: [],
	category3: [],
	category4: [],
	month: [],
	accountType: [],
	type: [],
	origin: [],
} 

const initialValue: UseFacets = {
	facets: emptyFacets,
	filteredFacets: emptyFacets, 
	fetchFacets: () => { null },
	loading: true,
}


export function useFacets() {
	const { filters } = useFilters();
	const [facets, setFacets] = useState(initialValue.facets)
	const [filteredFacets, setFilteredFacets] = useState(initialValue.facets)
	const [loading, setLoading] = useState(true)
	const { lastUpdate } = useNotifyUpdate()
  
	useEffect(() => { API.getFacets({filters:{}}).then(setFacets) }, [lastUpdate])
	useEffect(() => { fetch() }, [filters, lastUpdate])

	const fetch = async () => {
		setLoading(true)
		const facets = await API.getFacets({filters})
		setFilteredFacets(facets)
		setLoading(false)
	}

	return {
		facets,
		filteredFacets,
		fetchFacets: fetch,
		loading
	}
}
