import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button'
import { useAppContext } from '../AppContext';
import { TextField } from '@mui/material';
import { Transaction } from '../types'

function TransactionRow({ transaction }: { transaction: Transaction}) {
    const [open, setOpen] = React.useState(false)
    const { mappings, setMappings } = useAppContext()
    const [newCategoryName, setNewCategoryName] = React.useState<string>()
    const [newRegex, setNewRegex] = React.useState<string>()

    const setNewCategory = () => {
        if (newCategoryName && newRegex) {
            setMappings([...mappings, { categoryName: newCategoryName, regex: newRegex}])
        }
    }

    return (
    <>
        <TableRow>
            <TableCell>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell align="left">{transaction.category}</TableCell>
            <TableCell align="right">{transaction.origin}</TableCell>
            <TableCell align="right">{transaction.description}</TableCell>
            <TableCell align="right">{transaction.amount}</TableCell>
            <TableCell align="right">{transaction.date}</TableCell>
            <TableCell align="right">{transaction.month}</TableCell>
        </TableRow>
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 1 }}>
                    { 
                    <>
                        <TextField onChange={(e) => setNewRegex(e.target.value)} label="Regex" />
                        <TextField onChange={(e) => setNewCategoryName(e.target.value)} label="Category name" />
                        <Button onClick={setNewCategory}>Set</Button>
                    </>
                    }
                </Box>
            </Collapse>
            </TableCell>
        </TableRow>
    </>)
}
export function TransactionList() {
    const { transactions } = useAppContext()
    return (
        <TableContainer component={Paper}>
            <Table stickyHeader aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell align="left">Category</TableCell>
                        <TableCell align="right">Origin</TableCell>
                        <TableCell align="right">Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Date</TableCell>
                        <TableCell align="right">Month</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((t, i) => <TransactionRow key={`${t.date}-${t.description}-${t.amount}-${i}`} transaction={t} />)}
                </TableBody>
            </Table>
        </TableContainer>
    )
}