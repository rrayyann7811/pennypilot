import { useEffect, useRef, useState } from 'react';
import { parseAmount, today, validDate, validateTransaction } from '../utils/finance';
function TransactionForm({ transaction, onSave, onCancel }) {
  const [values, setValues] = useState({ title: transaction?.title ?? '', amount: transaction ? (transaction.amountPaise / 100).toFixed(2) : '', type: transaction?.type ?? 'expense', date: transaction && validDate(transaction.date) ? transaction.date : transaction ? '' : today() });
  const [errors, setErrors] = useState({});
  const titleInput = useRef(null);
  useEffect(() => { if (transaction) titleInput.current?.focus(); }, [transaction]);
  const submit = event => {
    event.preventDefault();
    const nextErrors = validateTransaction(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { event.currentTarget.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus(); return; }
    onSave({ title: values.title.trim(), amountPaise: parseAmount(values.amount), type: values.type, date: values.date });
    setValues({ title: '', amount: '', type: 'expense', date: today() });
  };
  return <section className="card transaction-form-card"><h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
    {transaction && !validDate(transaction.date) && <p>Original date: {transaction.date}. Select the correct date below.</p>}
    <form onSubmit={submit} className="form" noValidate>
      {['title', 'amount', 'type', 'date'].map(field => <div className="field" key={field}><label htmlFor={field}>{({ title: 'Title', amount: 'Amount (₹)', type: 'Type', date: 'Transaction date' })[field]}</label>
        {field === 'type' ? <select id={field} name={field} value={values[field]} onChange={e => setValues({ ...values, [field]: e.target.value })} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined}><option value="expense">Expense</option><option value="income">Income</option></select> : <input ref={field === 'title' ? titleInput : undefined} id={field} name={field} type={field === 'date' ? 'date' : 'text'} inputMode={field === 'amount' ? 'decimal' : undefined} value={values[field]} onChange={e => setValues({ ...values, [field]: e.target.value })} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${field}-error` : undefined} />}
        {errors[field] && <p className="error" id={`${field}-error`} role="alert">{errors[field]}</p>}
      </div>)}
      <button type="submit">{transaction ? 'Save Changes' : 'Add Transaction'}</button>{transaction && <button className="secondary-btn" type="button" onClick={onCancel}>Cancel Edit</button>}
    </form></section>;
}
export default TransactionForm;
