import { formatMoney } from '../../utils/finance';
import { savingsMetrics } from '../../utils/analytics';

export default function SavingsCard({ totals }) {
  const { savings, rate } = savingsMetrics(totals.income, totals.expense);
  return <section className="card analytics-metric" aria-labelledby="savings-heading"><h3 id="savings-heading">Monthly Savings</h3><p>Income: {formatMoney(totals.income)}</p><p>Expenses: {formatMoney(totals.expense)}</p><p className="analytics-value">Savings: {formatMoney(savings)}</p><p>Savings rate: {rate === null ? 'Not available' : `${rate}%`}</p>
    {rate === null && <p className="analytics-note">No income recorded; a savings rate cannot be calculated.</p>}
    {savings < 0n && <p className="expense-text">Expenses exceed income by {formatMoney(-savings)}. This is negative savings.</p>}
    {!totals.count && <p className="analytics-note">No transactions for this month.</p>}
  </section>;
}
