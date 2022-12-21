import { TransactionList } from './components/TransactionList';
import { BarChart } from './components/BarChart';
import { Filters } from './components/Filters';
import { Views } from './types'
import { useCallback, useState } from 'react';
import { UndoRedo } from './components/UndoRedo';
import { Stack, Box, FormLabel, Divider } from '@mui/material';
import { ViewSelector } from './components/ViewSelector';
import { log } from './utils';
import { UploadFiles } from './components/UploadFiles';
import { ExportFiles, ImportFiles } from './components/ConfigFilesControl';
import { ALL_FACETS } from 'expensifier-logic/shared.types';

function App() {
	const [view, setView] = useState<Views>(Views.List)
	const [viewBoxNode, setViewBoxNode] = useState<HTMLDivElement | undefined>()
	const refCallback = useCallback(node => {
		log('Node ref changed', node)
		node && setViewBoxNode(node)
	}, [])

	const ViewToRender = (view: Views) => {
		switch (view) {
			case Views.List: return <TransactionList parent={viewBoxNode} />
			case Views.Bar: return <BarChart setView={setView} />
		}
	}

	return (
		<Stack sx={{ height: '100vh', boxSizing: 'border-box' }}>
			<Box sx={{ bgcolor: '#DDDDDD' }}>
				<Stack direction='row' justifyContent='space-between' sx={{ bgcolor: '#CCCCCC', padding: 2 }}>
					<Stack direction='row' gap='16px'>
						<UploadFiles />
						<UndoRedo view={view} setView={setView} />
						<ViewSelector view={view} setView={setView} />
					</Stack>
					<Stack direction='row' gap='16px' alignItems='center'>
						<Divider orientation='vertical' sx={{color: 'black'}} />
						<FormLabel>Config Files:</FormLabel>
						<ExportFiles />
						<ImportFiles />
					</Stack>
				</Stack>
				<Box sx={{ padding: 2}}>
					<Filters filters={ALL_FACETS} />
				</Box>
			</Box>
			<Box ref={refCallback} sx={{ flex: 1 }}>{ViewToRender(view)}</Box>
		</Stack>
	);
}

export default App;
