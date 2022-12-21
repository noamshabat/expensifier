export {}
// import Paper from '@mui/material/Paper';
// import { PieChart as RePieChart, Pie, Cell, Tooltip, PieLabel } from 'recharts';
// import { useAppContext } from '../AppContext';
// import { TransactionType } from '../types';


// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'yellow', 'blue', 'cyan', 'magenta'];

// const RADIAN = Math.PI / 180;
// const renderCustomizedLabel: PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);

//   return (
//	 <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
//	   {`${(percent * 100).toFixed(0)}%`}
//	 </text>
//   );
// };

// export function PieChart() {
//   const { transactions, filteredCategories } = useAppContext()

//   const data = filteredCategories.reduce<{ name: string, value: number }[]>((agg, cat) => {
//	 const catTransactions = transactions.filter((t) => t.category === cat && t.type === TransactionType.Expense)
//	 const value = catTransactions.reduce((agg, t) => agg - t.amount, 0)
//	 return [...agg, { name: cat, value }]
//   }, [])

//   return (
//	 <Paper>
//		 <RePieChart width={400} height={400}>
//		   <Pie
//			 data={data}
//			 cx="50%"
//			 cy="50%"
//			 labelLine={true}
//			 label={renderCustomizedLabel}
//			 outerRadius={80}
//			 fill="#8884d8"
//			 dataKey="value"
//		   >
//			 {data.map((_, index) => (
//			   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//			 ))}
//		   </Pie>
//		   <Tooltip />
//		 </RePieChart>
//	 </Paper>
//   );
// }
