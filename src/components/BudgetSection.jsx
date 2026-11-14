import { useState } from 'react';
import { formatMoney, parseAmount, validDate } from '../utils/finance';
function BudgetEditor({ budget, onSave }) {
  const [amount, setAmount] = useState((budget / 100).toFixed(2));
  const [error, setError] = useState('');
  return <form className="budget-input-row" noValidate onSubmit={event => { event.preventDefault(); const value = parseAmount(amount, true); if (value === null) { setError('Enter a non-negative budget with up to two decimal places (maximum ₹10,00,00,00,000).'); return; } setError(''); onSave(value); }}><div className="field"><label htmlFor="budget">Budget (₹)</label><input id="budget" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'budget-error' : undefined} /></div><button>Save Budget</button>{error && <p id="budget-error" className="error" role="alert">{error}</p>}</form>;
}
function BudgetSection({ budget, onSave, expenses, month, setMonth }) {
  const percentage = budget > 0 ? Math.min(Number(expenses) / budget * 100, 100) : expenses > 0 ? 100 : 0;
  return <section className="card budget-card"><div className="budget-header"><div><p className="eyebrow">PLAN YOUR SPENDING</p><h2>Monthly Budget</h2></div><div className="budget-month-field"><label htmlFor="budget-month">Tracking month</label><input id="budget-month" type="month" value={month} onChange={e => { if (validDate(`${e.target.value}-01`)) setMonth(e.target.value); }} /></div></div>
    <div className="budget-body">
    <BudgetEditor key={`${month}-${budget}`} budget={budget} onSave={onSave} />
    <div className="budget-totals"><p>Total Budget: {formatMoney(budget)}</p><p>Monthly Expenses: {formatMoney(expenses)}</p><p>Remaining Budget: {formatMoney(BigInt(budget) - BigInt(expenses))}</p></div></div>
    <div className="budget-progress-label"><span>Budget utilization</span><span>{budget === 0 ? (expenses > 0 ? 'Spending with no budget' : 'No budget allocated') : expenses > budget ? 'Budget exceeded' : `${percentage.toFixed(0)}% used`}</span></div>
    <div className={`progress-bar ${expenses > budget ? 'budget-exceeded' : ''}`} role="progressbar" aria-label="Monthly budget used" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div className="progress-fill" style={{ width: `${percentage}%` }} /></div>
    {expenses > budget && <p className="warning-text">Warning: You have crossed your budget.</p>}</section>;
}
export default BudgetSection;
