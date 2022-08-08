import { TransactionList } from './components/TransactionList';
import { BarChart } from './components/BarChart';
import { Filters } from './components/Filters';
import { Views } from './types'
import { useCallback, useState } from 'react';
import { UndoRedo } from './components/UndoRedo';
import { Stack, Box } from '@mui/material';
import { ViewSelector } from './components/ViewSelector';
import { log } from './utils';
import { ALL_FACETS } from './shared.types';
import { UploadFiles } from './components/UploadFiles';

function App() {
  const [ view, setView ] = useState<Views>(Views.List)
  const [viewBoxNode, setViewBoxNode] = useState<HTMLDivElement|undefined>()
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
    <Stack sx={{padding: '32px', height: '100vh', boxSizing: 'border-box'}}>
      <Stack direction='row' gap='16px'>
        <UploadFiles />
        <UndoRedo view={view} setView={setView} />
        <ViewSelector view={view} setView={setView} />
      </Stack>
      <Filters filters={ALL_FACETS} />
      <Box ref={refCallback} sx={{flex: 1, overflowY: 'scroll'}}>{ViewToRender(view)}</Box>
    </Stack>
  );
}

export default App;
