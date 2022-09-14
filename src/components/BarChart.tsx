import { useTransactions } from "../hooks/useTransactions";
import Paper from '@mui/material/Paper';
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, BarChart as ReBarChart } from "recharts";
import { Views } from "../types";
import { ALL_CATEGORIES, CategoryKeys, TransactionType } from '../shared.types'
import Box from "@mui/material/Box";
import { useRef, useState } from "react";
import { useFacets } from "../hooks/useFacets";
import CircularProgress from "@mui/material/CircularProgress";
import { useFilters } from "../context/FiltersContext";
import Typography from "@mui/material/Typography";

export function BarChart(p: { setView: (view:Views) => void }) {
    const { transactions, loading: transactionsLoading } = useTransactions()
    const { filteredFacets, loading: facetsLoading } = useFacets()
    const { setFilters } = useFilters()
    const [hoveredExpense, setHoveredExpense] = useState('')

    const hoveredCategory = useRef('')
    const setHoveredCategory = (cat: string) => hoveredCategory.current = cat

    if (facetsLoading || transactionsLoading) return <CircularProgress />

    const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#00B3E6', 
    '#E6B333', '#3366E6', '#999966', '#B34D4D',
    '#809900', '#E6B3B3', '#6680B3', '#66991A', 
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF']

    type ChartDataType = ({
        month: string,
        income: number,
    } | { [key: string]: number})[]

    const byCategory = (categoryKey: CategoryKeys, monthName: string) => filteredFacets[categoryKey].reduce<{[key: string]: number}>((catAgg, cat) => {
        catAgg[`${categoryKey}-${cat}`] = transactions.filter((f) => f.month === monthName && f.type === TransactionType.Expense && f[categoryKey] === cat)
                                 .reduce<number>((last, curr) => last - curr.amount, 0)
        return catAgg
    }, {})
    const chartData = filteredFacets.month.reduce<ChartDataType>((agg, monthName) => {
        agg.push({
            month: monthName,
            ...byCategory('category', monthName),
            ...byCategory('category2', monthName),
            ...byCategory('category3', monthName),
            ...byCategory('category4', monthName),
            income: transactions.filter((f) => f.month === monthName && f.type === TransactionType.Income).reduce<number>((last, curr) => last + curr.amount, 0),
        })
        return agg
    }, []).sort((a, b) => {
        if (a.month > b.month) return 1
        return -1
    })

    const totalExpense = transactions.filter((t) => t.type === TransactionType.Expense).reduce((agg, t) => agg - t.amount, 0)
    const totalIncome = transactions.filter((t) => t.type === TransactionType.Income).reduce((agg, t) => agg + t.amount, 0)

    // round to 2 deimal points
    chartData.map((d,i) => Object.entries(d).forEach(([key, value]) => {
        if (typeof value === 'number') chartData[i][key as keyof typeof chartData[0]] = Math.round(value*100) / 100
    }))

    return (
        <Paper sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
            <ReBarChart
                data={chartData}
                height={450}
                margin={{
                    bottom: 5,
                    left: 20,
                    right: 30,
                    top: 5
                }}
                width={1400}
                >
                <CartesianGrid />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip  
                    offset={75}
                    content={(props) => {
                        if (!props.payload) return null
                        const cats = props.payload.filter((i) => typeof i.dataKey === 'string' && i.dataKey.startsWith(`${hoveredCategory.current}-`) || i.dataKey === 'income')
                        if (cats.length === 0) return null

                        const barExpense = cats.filter((i) => (i.dataKey as string) !== 'income').reduce((agg, i) => agg + (i.value as number || 0), 0)
                        return <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                gap: '0px',
                                backgroundColor: 'white',
                                border: 'solid 1px #5f5f5f',
                                padding: '16px',
                                borderRadius: '8px',
                            }}>
                            <Typography variant='caption' style={{ 
                                display: 'flex', 
                                gap: '20px',
                                justifyContent: 'space-between',
                                color: 'red',
                                fontWeight: 'bold',
                            }}>
                                <div>total expense</div>
                                <div>{Math.round(barExpense * 100)/100}</div>
                            </Typography>
                            { cats.map((i) => <>
                                    <Typography variant='caption' sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        color: (i as { fill:string}).fill,
                                        backgroundColor: i.dataKey === hoveredExpense ? '#dfdfdf' : 'transparent',
                                        fontWeight: i.dataKey === hoveredExpense || i.dataKey === 'income' ? 'bold' : 'normal',
                                    }}>
                                        <div>{(i.dataKey as string).replace(`${hoveredCategory.current}-`,'')}</div>
                                        <div>{i.value}</div>
                                    </Typography>
                                    { i.dataKey === 'income' && <div style={{ width: '100%', height: '1px', backgroundColor: '#dfdfdf', margin: '6px 0px'}} />}
                                </>
                            )}
                        </Box>
                    }}
                />
                <Legend />
                <Bar
                    dataKey="income"
                    fill="#463edb"
                    stackId="income"
                />
                {
                    ALL_CATEGORIES.map((categoryKey) => {
                        return Object.keys(chartData[0]).filter((key) => key.startsWith(`${categoryKey}-`)).map((cat, ix) => {
                            const catName = cat.replace(`${categoryKey}-`, '')
                            return <Bar
                                onMouseOver={() => { setHoveredExpense(cat); setHoveredCategory(categoryKey) }}
                                onMouseOut={() => { setHoveredExpense(''); setHoveredCategory('') }}
                                style={{cursor: 'hand'}}
                                key={cat}
                                dataKey={cat}
                                fill={colorArray[ix % colorArray.length]}
                                stackId={`${categoryKey}-expense`}
                                onClick={(data) => {
                                    setFilters({ [categoryKey]: [catName], month: [data.month] })
                                    setTimeout(() => p.setView(Views.List), 0)
                                }}
                            />
                        })
                    })
                }
            </ReBarChart>
            <Box sx={{display: 'flex', gap: '25px', justifyContent: 'center'}} >
                <div style={{ color: '#463edb'}}>Total Income: {Math.round(totalIncome * 100) / 100}</div>
                <div style={{ color: 'red'}}>Total Expense: {Math.round(totalExpense * 100) / 100}</div>
                <div style={{ color: 'green'}}>Total Balance: {Math.round(totalIncome * 100) / 100 - Math.round(totalExpense * 100) / 100}</div>
            </Box>
        </Paper>
      );
}