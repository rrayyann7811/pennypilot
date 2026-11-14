import { useMemo, useState } from 'react';
import SummaryCard from './components/SummaryCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetSection from './components/BudgetSection';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import DataManagement from './components/DataManagement';
import { restoreBackup } from './utils/backup';
import { today, totals, filterTransactions, newId, validDate } from './utils/finance';
import { loadData, saveData } from './utils/storage';

function App() {
  const [initial, setInitial] = useState(() => { try { return loadData(window.localStorage); } catch { return loadData(null); } });
  const [data, setData] = useState(initial.data);
  const [warning, setWarning] = useState(initial.warning);
  const [editing, setEditing] = useState(null);
  const [month, setMonth] = useState(today().slice(0, 7));
  const [filters, setFilters] = useState({ search: '', type: '', month: '', sort: 'newest' });
  const summary = useMemo(() => totals(data.transactions), [data.transactions]);
  const monthlyExpenses = useMemo(() => totals(filterTransactions(data.transactions, { month })).expense, [data.transactions, month]);
  const visibleTransactions = useMemo(() => filterTransactions(data.transactions, filters), [data.transactions, filters]);
  const update = (next) => {
    setData(next);
    if (initial.writable) {
      try { if (!saveData(window.localStorage, next)) setWarning('Browser storage is unavailable or full. Changes remain in this session only.'); else setWarning(''); }
      catch { setWarning('Browser storage is unavailable. Changes remain in this session only.'); }
    }
  };
  const saveTransaction = (transaction) => {
    const transactions = editing ? data.transactions.map(item => item.id === editing.id ? { ...item, ...transaction } : item) : [{ ...transaction, id: newId(data.transactions) }, ...data.transactions];
    update({ ...data, transactions });
    setEditing(null);
  };
  const deleteTransaction = (id) => {
    update({ ...data, transactions: data.transactions.filter(item => item.id !== id) });
    if (editing?.id === id) setEditing(null);
  };
  const restoreData = (next) => {
    let storage;
    try { storage = window.localStorage; } catch { storage = null; }
    const result = restoreBackup(storage, next, true);
    setData(result.data);
    setInitial({ data: result.data, writable: true, warning: '' });
    setWarning('');
    setEditing(null);
    setFilters({ search: '', type: '', month: '', sort: 'newest' });
  };
  return <main className="app">
    <header className="header">
      <div className="brand"><span className="brand-mark" aria-hidden="true">P</span><div><p className="brand-name">PennyPilot</p><p className="brand-subtitle">Personal finance, thoughtfully tracked.</p></div></div>
      <span className="header-label">Personal finance dashboard</span>
    </header>
    <div className="overview-heading"><p className="eyebrow">YOUR MONEY AT A GLANCE</p><h1>Financial overview</h1><p>A clearer picture of your income, spending, and savings.</p></div>
    {warning && <p className="notice" role="alert">{warning}</p>}
    {data.transactions.some(item => !validDate(item.date)) && <p className="notice">Some saved dates need review. These transactions count in overall totals, but are excluded from monthly tracking. Edit them to choose a date.</p>}
    <section className="summary-grid" aria-label="All-time totals"><SummaryCard title="Total Income" amount={summary.income} /><SummaryCard title="Total Expenses" amount={summary.expense} /><SummaryCard title="Balance" amount={summary.balance} /></section>
    <BudgetSection budget={data.budgets[month] ?? data.defaultBudget} month={month} setMonth={setMonth} expenses={monthlyExpenses} onSave={budget => update({ ...data, budgets: { ...data.budgets, [month]: budget } })} />
    <AnalyticsDashboard transactions={data.transactions} budgets={data.budgets} defaultBudget={data.defaultBudget} />
    <div className="section-heading"><h2>Transaction management</h2><p>Add, review, and organize your financial activity.</p></div>
    <div className="main-grid"><TransactionForm key={editing ? `edit-${editing.id}` : 'new'} transaction={editing} onSave={saveTransaction} onCancel={() => setEditing(null)} /><TransactionList transactions={visibleTransactions} totalCount={data.transactions.length} filters={filters} setFilters={setFilters} onEdit={item => { setEditing(item); }} onDelete={deleteTransaction} onClearAll={() => { if (window.confirm('Clear all transaction history, including transactions hidden by filters? This cannot be undone.')) { update({ ...data, transactions: [] }); setEditing(null); } }} /></div>
    <DataManagement data={data} onRestore={restoreData} />
  </main>;
}
export default App;
