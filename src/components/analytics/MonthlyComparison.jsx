import { formatMoney } from '../../utils/finance';
import { monthLabel } from '../../utils/analytics';

export default function MonthlyComparison({ comparison }) {
  const { current, previous, previousMonth } = comparison;
  return <section className="card analytics-metric" aria-labelledby="comparison-heading"><h3 id="comparison-heading">Monthly Comparison</h3>
    {!previousMonth ? <p>No earlier month is supported before January 0001.</p> : <><p className="analytics-note">{monthLabel(current.month)} vs {monthLabel(previousMonth)}. Changes are current minus previous.</p>
      {['income', 'expense', 'savings'].map(key => { const change = comparison[key]; return <div className="comparison-row" key={key}><h4>{key === 'expense' ? 'Expense' : key[0].toUpperCase() + key.slice(1)} change</h4><p>{change.delta > 0n ? '+' : ''}{formatMoney(change.delta)}{change.percent !== null && ` (${change.delta > 0n ? '+' : ''}${change.percent}%)`}</p>{change.percent === null && <p className="analytics-note">Percentage unavailable: previous {key === 'expense' ? 'expenses' : key} {previous[key] < 0n ? 'were negative' : 'was zero'}.</p>}</div>; })}
      {!current.count && !previous.count && <p className="analytics-note">No transactions in either comparison month.</p>}</>}
  </section>;
}
