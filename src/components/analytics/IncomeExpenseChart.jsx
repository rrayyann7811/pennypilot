import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { axisMoney } from '../../utils/analytics';
import { ChartDetails, MoneyTooltip } from './ChartDetails';

export default function IncomeExpenseChart({ rows }) {
  const hasData = rows.some(row => row.count > 0);
  return <section className="card analytics-chart" aria-labelledby="income-expense-heading"><h3 id="income-expense-heading">Income vs Expenses</h3>
    {!hasData ? <p className="analytics-empty">No transactions in this period. Add an income or expense to see this chart.</p> : <div className="chart-frame"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 280 }}><BarChart aria-labelledby="income-expense-heading" data={rows} accessibilityLayer margin={{ top: 12, right: 12, left: 0, bottom: 8 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: '#526178' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={12} /><YAxis tickFormatter={axisMoney} width={66} tick={{ fontSize: 11, fill: '#526178' }} tickLine={false} axisLine={false} /><Tooltip cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }} content={<MoneyTooltip />} isAnimationActive={false} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} /><Bar dataKey="incomeRupees" name="Income" fill="#15803d" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} /><Bar dataKey="expenseRupees" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>}
    <ChartDetails rows={rows} />
  </section>;
}
