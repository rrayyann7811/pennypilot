import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { axisMoney } from '../../utils/analytics';
import { ChartDetails, MoneyTooltip } from './ChartDetails';

export default function SpendingTrendChart({ rows }) {
  const hasExpenses = rows.some(row => row.expense > 0n);
  return <section className="card analytics-chart" aria-labelledby="spending-trend-heading"><h3 id="spending-trend-heading">Monthly Spending Trend</h3>
    {!hasExpenses ? <p className="analytics-empty">No expenses in this period. Months without spending are recorded as ₹0.00.</p> : <div className="chart-frame"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 280 }}><LineChart aria-labelledby="spending-trend-heading" data={rows} accessibilityLayer margin={{ top: 12, right: 12, left: 0, bottom: 8 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#526178' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={12} /><YAxis tickFormatter={axisMoney} width={66} tick={{ fontSize: 11, fill: '#526178' }} tickLine={false} axisLine={false} /><Tooltip cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }} content={<MoneyTooltip />} isAnimationActive={false} /><Line type="linear" dataKey="expenseRupees" name="Expenses" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>}
    <ChartDetails rows={rows} expensesOnly />
  </section>;
}
