import { formatMoney } from '../utils/finance';
function SummaryCard({ title, amount }) {
  const tone = title === 'Total Income' ? 'income' : title === 'Total Expenses' ? 'expense' : amount < 0 ? 'negative' : 'balance';
  return <div className={`card summary-card summary-${tone}`}>
    <div className="summary-label"><h3>{title}</h3><span className="summary-icon" aria-hidden="true">{title === 'Total Income' ? '↗' : title === 'Total Expenses' ? '↘' : '='}</span></div>
    <p>{formatMoney(amount)}</p><span className="summary-caption">All-time total</span>
  </div>;
}
export default SummaryCard;
