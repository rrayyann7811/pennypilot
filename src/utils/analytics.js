import { validDate } from './finance.js';

export const validMonth = month => typeof month === 'string' && validDate(`${month}-01`);

// Calendar arithmetic avoids timezone shifts and JavaScript's special handling of years 0–99.
export function shiftMonth(month, offset) {
  if (!validMonth(month) || !Number.isInteger(offset)) return null;
  const [year, number] = month.split('-').map(Number);
  const index = (year - 1) * 12 + number - 1 + offset;
  if (index < 0 || index >= 9999 * 12) return null;
  return `${String(Math.floor(index / 12) + 1).padStart(4, '0')}-${String(index % 12 + 1).padStart(2, '0')}`;
}

export function monthLabel(month) {
  if (!validMonth(month)) return 'Unavailable';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
}

export function monthlyTotals(transactions, month) {
  const result = { month, income: 0n, expense: 0n, savings: 0n, count: 0 };
  if (!validMonth(month)) return result;
  for (const item of transactions) {
    if (!validDate(item.date) || item.date.slice(0, 7) !== month) continue;
    if (!['income', 'expense'].includes(item.type) || !Number.isSafeInteger(item.amountPaise) || item.amountPaise <= 0) continue;
    result[item.type] += BigInt(item.amountPaise);
    result.count++;
  }
  result.savings = result.income - result.expense;
  return result;
}

export function sixMonthTotals(transactions, endMonth) {
  if (!validMonth(endMonth)) return [];
  return Array.from({ length: 6 }, (_, index) => shiftMonth(endMonth, index - 5))
    .filter(Boolean).map(month => ({ ...monthlyTotals(transactions, month), label: monthLabel(month) }));
}

// Percentages are rounded half away from zero to two decimal places using exact integers.
// null means undefined, rather than an invented zero percentage.
export function percentage(numerator, denominator) {
  const base = BigInt(denominator);
  if (base <= 0n) return null;
  const value = BigInt(numerator);
  const absolute = value < 0n ? -value : value;
  const hundredths = (absolute * 10000n + base / 2n) / base;
  return `${value < 0n && hundredths > 0n ? '-' : ''}${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')}`;
}

export function savingsMetrics(income, expense) {
  const savings = BigInt(income) - BigInt(expense);
  return { savings, rate: percentage(savings, income) };
}

export function compareValues(current, previous) {
  const delta = BigInt(current) - BigInt(previous);
  return { delta, percent: percentage(delta, previous) };
}

export function monthlyComparison(transactions, month) {
  const previousMonth = shiftMonth(month, -1);
  const current = monthlyTotals(transactions, month);
  const previous = monthlyTotals(transactions, previousMonth);
  return {
    previousMonth, current, previous,
    income: compareValues(current.income, previous.income),
    expense: compareValues(current.expense, previous.expense),
    savings: compareValues(current.savings, previous.savings),
  };
}

export function budgetMetrics(budget, expenses) {
  const remaining = BigInt(budget) - BigInt(expenses);
  const utilization = percentage(expenses, budget);
  const exceeded = remaining < 0n;
  const progress = utilization === null ? (exceeded ? 100 : 0) : Math.min(100, Number(utilization));
  return { remaining, utilization, exceeded, progress, color: exceeded ? '#dc2626' : progress >= 80 ? '#a16207' : '#15803d' };
}

// Recharts needs Number coordinates. Exact paise stay on each row for tooltips/tables.
export const chartRows = months => months.map(row => ({ ...row, incomeRupees: Number(row.income) / 100, expenseRupees: Number(row.expense) / 100 }));
export const axisMoney = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 }).format(value);
