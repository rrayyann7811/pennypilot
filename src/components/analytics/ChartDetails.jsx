import { formatMoney } from '../../utils/finance';

export function MoneyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return <div className="analytics-tooltip"><p><strong>{row.label}</strong></p>{payload.map(item => <p key={item.dataKey}>{item.name}: {formatMoney(item.dataKey === 'incomeRupees' ? row.income : row.expense)}</p>)}</div>;
}

export function ChartDetails({ rows, expensesOnly = false }) {
  return <details className="chart-details"><summary>View chart values as a table</summary><div className="analytics-table-wrap"><table><caption>{expensesOnly ? 'Monthly expenses' : 'Monthly income and expenses'} in Indian rupees</caption><thead><tr><th scope="col">Month</th>{!expensesOnly && <th scope="col">Income</th>}<th scope="col">Expenses</th></tr></thead><tbody>{rows.map(row => <tr key={row.month}><th scope="row">{row.label}</th>{!expensesOnly && <td>{formatMoney(row.income)}</td>}<td>{formatMoney(row.expense)}</td></tr>)}</tbody></table></div></details>;
}
