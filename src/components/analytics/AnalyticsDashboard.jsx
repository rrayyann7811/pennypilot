import { lazy, memo, Suspense, useMemo, useState } from 'react';
import { today } from '../../utils/finance';
import { chartRows, monthlyComparison, monthLabel, sixMonthTotals, validMonth } from '../../utils/analytics';
import ChartBoundary from './ChartBoundary';
const AnalyticsCharts = lazy(() => import('./AnalyticsCharts'));
import SavingsCard from './SavingsCard';
import MonthlyComparison from './MonthlyComparison';
import BudgetInsights from './BudgetInsights';

function AnalyticsDashboard({ transactions, budgets, defaultBudget }) {
  const [month, setMonth] = useState(today().slice(0, 7));
  const rows = useMemo(() => chartRows(sixMonthTotals(transactions, month)), [transactions, month]);
  const comparison = useMemo(() => monthlyComparison(transactions, month), [transactions, month]);
  return <section className="analytics-dashboard" aria-labelledby="analytics-heading"><div className="analytics-header"><div><h2 id="analytics-heading">Financial Analytics</h2><p className="analytics-note">Explore your income, spending, and savings.</p></div><div><label htmlFor="analytics-month">Analytics month</label><input id="analytics-month" type="month" min="0001-01" max="9999-12" value={month} onChange={event => { if (validMonth(event.target.value)) setMonth(event.target.value); }} /></div></div>
    <p className="analytics-period" role="status">Metrics for {monthLabel(month)}. Charts cover {monthLabel(rows[0]?.month)} to {monthLabel(month)}{rows.length < 6 ? ' (earliest supported months)' : ' (six calendar months)'}.</p>
    <div className="analytics-metrics"><SavingsCard totals={comparison.current} /><MonthlyComparison comparison={comparison} /><BudgetInsights budget={budgets[month] ?? defaultBudget} expenses={comparison.current.expense} /></div>
    <ChartBoundary><Suspense fallback={<p className="notice" role="status">Loading charts…</p>}><AnalyticsCharts rows={rows} /></Suspense></ChartBoundary>
  </section>;
}

export default memo(AnalyticsDashboard);
