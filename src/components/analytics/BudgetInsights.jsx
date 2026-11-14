import { budgetMetrics } from '../../utils/analytics';
import { formatMoney } from '../../utils/finance';

export default function BudgetInsights({ budget, expenses }) {
  const metrics = budgetMetrics(budget, expenses);
  return <section className="card analytics-metric" aria-labelledby="budget-insights-heading"><h3 id="budget-insights-heading">Budget Insights</h3><p>Monthly budget: {formatMoney(budget)}</p><p>Budget utilization: {metrics.utilization === null ? 'Not available (zero budget)' : `${metrics.utilization}%`}</p><p className="analytics-value">Remaining budget: {formatMoney(metrics.remaining)}</p><div className="progress-bar" role="progressbar" aria-label="Analytics budget used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={metrics.progress} aria-valuetext={metrics.utilization === null ? 'No budget allocated' : `${metrics.utilization}% used`}><div className="progress-fill" style={{ width: `${metrics.progress}%`, background: metrics.color }} /></div><p className="budget-status" style={{ color: metrics.color }}>{metrics.exceeded ? `Budget exceeded by ${formatMoney(-metrics.remaining)}.` : metrics.remaining === 0n && budget > 0 ? 'Budget fully used.' : budget === 0 ? 'No budget allocated.' : 'Within budget.'}</p></section>;
}
