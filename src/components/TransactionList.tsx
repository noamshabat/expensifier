import * as React from 'react';
import Box from '@mui/material/Box';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useTransactions } from '../hooks/useTransactions';
import { Chip, Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress'
import { Transaction, UNDEFINED_CATEGORY } from 'expensifier-logic/shared.types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SetCategoryDialog } from './SetCategoryDialog';
import moment from 'moment';
import { useNotifyUpdate } from '../context/RefetchContext';
import { useCallback, useEffect, useState } from 'react';

function CategoryCell({ transaction }: { transaction: Transaction }) {
	if (transaction.category === UNDEFINED_CATEGORY &&
		transaction.category2 === UNDEFINED_CATEGORY &&
		transaction.category3 === UNDEFINED_CATEGORY &&
		transaction.category4 === UNDEFINED_CATEGORY) {
		return <Chip label={UNDEFINED_CATEGORY} />
	}
	return <Stack direction='row' spacing={1}>
		{transaction.category && transaction.category !== UNDEFINED_CATEGORY && <Chip size="small" color={'primary'} label={transaction.category} />}
		{transaction.category2 && transaction.category2 !== UNDEFINED_CATEGORY && <Chip size="small" color={'secondary'} label={transaction.category2} />}
		{transaction.category3 && transaction.category3 !== UNDEFINED_CATEGORY && <Chip size="small" color={'warning'} label={transaction.category3} />}
		{transaction.category4 && transaction.category4 !== UNDEFINED_CATEGORY && <Chip size="small" color={'success'} label={transaction.category4} />}
	</Stack>
}

function _TransactionRow({ transaction }: { transaction: Transaction }) {
	return (
		<>
			<TableRow sx={{
				'.dialog': { opacity: 0, pointerEvents: 'none' },
				'&:hover': {
					'.dialog': { opacity: 1, pointerEvents: 'auto' }
				}
			}}>
				<TableCell key="category" align="left">
					<Stack direction='row' alignItems='center'>
						{<CategoryCell transaction={transaction} />}
						<Box className='dialog' sx={{ marginLeft: 'auto' }}><SetCategoryDialog transaction={transaction} /></Box>
					</Stack>
				</TableCell>
				<TableCell key="origin" align="right">{transaction.origin}</TableCell>
				<TableCell key="desc" align="right">{transaction.description}</TableCell>
				<TableCell key="amount" align="right">{transaction.amount}</TableCell>
				<TableCell key="date" align="right">{moment(transaction.timestamp).format('DD-MM-YYYY')}</TableCell>
				<TableCell key="month" align="right">{transaction.month}</TableCell>
			</TableRow>
		</>)
}
function _TransactionList(p: { parent: HTMLDivElement | undefined }) {
	const BATCH_SIZE = 40
	const { transactions, fetchNext, hasMore, refresh } = useTransactions(BATCH_SIZE)
	const { lastUpdate } = useNotifyUpdate()

	const [viewBoxNode, setViewBoxNode] = useState<HTMLDivElement | null>(null)
	const refCallback = useCallback(node => {
		node && setViewBoxNode(node)
	}, [])

	useEffect(() => { refresh() }, [lastUpdate])

	if (!p.parent) return null
	return (
		<TableContainer component={Paper} ref={refCallback} style={{ maxHeight: `${p.parent?.offsetHeight}px` }}>
			{viewBoxNode && <InfiniteScroll
				dataLength={transactions.length}
				next={() => fetchNext()}
				hasMore={hasMore}
				loader={<CircularProgress size="20px" />}
				scrollableTarget={viewBoxNode}
				style={{ overflow: 'initial !important' }}
			>
				<Table stickyHeader aria-label="collapsible sticky table" size="small">
					<TableHead>
						<TableRow>
							<TableCell key="category" align="left">Category</TableCell>
							<TableCell key="origin" align="right">Origin</TableCell>
							<TableCell key="desc" align="right">Description</TableCell>
							<TableCell key="amount" align="right">Amount</TableCell>
							<TableCell key="date" align="right">Date</TableCell>
							<TableCell key="month" align="right">Month</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{transactions.map((t, i) => <TransactionRow key={`${t.date}-${t.description}-${t.amount}-${i}`} transaction={t} />)}
					</TableBody>
				</Table>
			</InfiniteScroll>}
		</TableContainer>
	)
}

const TransactionRow = React.memo(_TransactionRow)
export const TransactionList = React.memo(_TransactionList)