export const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function parseAmount(value, allowZero = false) {
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(paise) && paise <= 1000000000000 && (allowZero ? paise >= 0 : paise > 0) ? paise : null;
}
const moneyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
export function formatMoney(paise) {
  const exact = BigInt(paise);
  const absolute = exact < 0n ? -exact : exact;
  const formatted = moneyFormatter.formatToParts(absolute / 100n).map(part => part.type === 'fraction' ? String(absolute % 100n).padStart(2, '0') : part.value).join('');
  return exact < 0n ? `-${formatted}` : formatted;
}
export function validateTransaction(values) {
  const errors = {};
  if (!values.title?.trim() || values.title.trim().length > 100) errors.title = 'Enter a title between 1 and 100 characters.';
  if (parseAmount(values.amount) === null) errors.amount = 'Enter an amount above zero with up to two decimal places (maximum ₹10,00,00,00,000).';
  if (!['income', 'expense'].includes(values.type)) errors.type = 'Choose income or expense.';
  if (!validDate(values.date)) errors.date = 'Choose a valid transaction date.';
  return errors;
}
export function totals(transactions) {
  const exact = transactions.reduce((result, item) => {
    result[item.type] += BigInt(item.amountPaise);
    return result;
  }, { income: 0n, expense: 0n });
  exact.balance = exact.income - exact.expense;
  return Object.fromEntries(Object.entries(exact).map(([key, value]) => [key, value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(value) : value]));
}
export function filterTransactions(transactions, { search = '', type = '', month = '', sort = 'newest' } = {}) {
  return transactions.filter(item => item.title.toLowerCase().includes(search.trim().toLowerCase()) && (!type || item.type === type) && (!month || (validDate(item.date) && item.date.startsWith(month))))
    .sort((a, b) => {
      if (sort === 'highest' || sort === 'lowest') return sort === 'highest' ? b.amountPaise - a.amountPaise : a.amountPaise - b.amountPaise;
      if (!validDate(a.date)) return validDate(b.date) ? 1 : 0;
      if (!validDate(b.date)) return -1;
      return sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    });
}
export function newId(items) {
  let id;
  do { id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; } while ((items instanceof Set ? items.has(id) : items.some(item => item.id === id)));
  return id;
}
