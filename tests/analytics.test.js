import test from 'node:test';
import assert from 'node:assert/strict';
import { monthlyTotals, sixMonthTotals, savingsMetrics, percentage, compareValues, monthlyComparison, budgetMetrics, shiftMonth, monthLabel, chartRows } from '../src/utils/analytics.js';
import { formatMoney } from '../src/utils/finance.js';
const row = (type, amountPaise, date) => ({ type, amountPaise, date });
const records = [row('income', 10000, '2026-01-01'), row('expense', 10, '2026-01-15'), row('expense', 20, '2026-01-31'), row('expense', 100, '2025-12-31'), row('income', 5000, '2025-12-01')];

test('monthly aggregation uses exact paise and includes calendar endpoints', () => {
  assert.deepEqual(monthlyTotals(records, '2026-01'), { month: '2026-01', income: 10000n, expense: 30n, savings: 9970n, count: 3 });
  assert.equal(monthlyTotals(records, '2025-12').expense, 100n);
  assert.equal(monthlyTotals(records, '2026-02').count, 0);
});
test('aggregation excludes unresolved and invalid dates without mutating data', () => {
  const items = [...records, row('expense', 999, '2026-01-32'), row('expense', 999, '01/01/2026'), row('expense', 999, '2026-02-29')];
  const before = JSON.stringify(items);
  assert.equal(monthlyTotals(items, '2026-01').expense, 30n);
  assert.equal(monthlyTotals(items, '2026-02').expense, 0n);
  assert.equal(JSON.stringify(items), before);
});
test('six-month series is chronological and fills missing months across year boundaries', () => {
  const rows = sixMonthTotals(records, '2026-03');
  assert.deepEqual(rows.map(item => item.month), ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']);
  assert.deepEqual(rows.map(item => item.expense), [0n, 0n, 100n, 30n, 0n, 0n]);
  assert.equal(rows[0].label, 'Oct 2025');
});
test('empty datasets have zero totals and no invented savings rate', () => {
  const rows = sixMonthTotals([], '2026-11');
  assert.equal(rows.length, 6);
  assert.ok(rows.every(item => item.income === 0n && item.expense === 0n && item.count === 0));
  assert.deepEqual(savingsMetrics(0, 0), { savings: 0n, rate: null });
  assert.equal(monthlyComparison([], '2026-11').income.percent, null);
});
test('savings and rates handle income-only, zero-income, and overspending', () => {
  assert.deepEqual(savingsMetrics(10000, 2500), { savings: 7500n, rate: '75.00' });
  assert.deepEqual(savingsMetrics(10000, 0), { savings: 10000n, rate: '100.00' });
  assert.deepEqual(savingsMetrics(0, 2500), { savings: -2500n, rate: null });
  assert.deepEqual(savingsMetrics(10000, 15000), { savings: -5000n, rate: '-50.00' });
  assert.equal(savingsMetrics(100, 100).rate, '0.00');
});
test('percentage rounding is exact and handles small signed values', () => {
  assert.equal(percentage(1, 3), '33.33');
  assert.equal(percentage(2, 3), '66.67');
  assert.equal(percentage(-1, 32), '-3.13');
  assert.equal(percentage(1, 32), '3.13');
  assert.equal(percentage(-1, 1000000), '0.00');
  assert.equal(percentage(1, 0), null);
  assert.equal(percentage(1, -1), null);
});
test('month comparison uses previous calendar month, exact deltas and meaningful percentages', () => {
  const comparison = monthlyComparison(records, '2026-01');
  assert.equal(comparison.previousMonth, '2025-12');
  assert.deepEqual(comparison.income, { delta: 5000n, percent: '100.00' });
  assert.deepEqual(comparison.expense, { delta: -70n, percent: '-70.00' });
  assert.deepEqual(comparison.savings, { delta: 5070n, percent: '103.47' });
  assert.deepEqual(compareValues(100, 0), { delta: 100n, percent: null });
  assert.deepEqual(compareValues(100, -100), { delta: 200n, percent: null });
  assert.deepEqual(compareValues(-100, 100), { delta: -200n, percent: '-200.00' });
  assert.deepEqual(compareValues(0, 100), { delta: -100n, percent: '-100.00' });
});
test('large totals, savings, percentages, and chart payloads retain exact money', () => {
  const rows = Array.from({ length: 9008 }, () => row('income', 1000000000000, '2026-01-01'));
  rows.push(row('income', 1, '2026-01-02'), row('expense', 1, '2026-01-03'));
  const totals = monthlyTotals(rows, '2026-01');
  assert.equal(totals.income, 9008000000000001n);
  assert.equal(totals.savings, 9008000000000000n);
  assert.equal(savingsMetrics(totals.income, totals.expense).rate, '100.00');
  assert.equal(formatMoney(totals.income), '₹9,00,80,00,00,00,000.01');
  assert.equal(percentage(totals.income, 1), '900800000000000100.00');
  const chart = chartRows([{ ...totals, label: 'Jan 2026' }])[0];
  assert.ok(Number.isFinite(chart.incomeRupees));
  assert.equal(chart.income, totals.income);
});
test('budget metrics handle zero, fully used, near limit and exceeded budgets', () => {
  assert.deepEqual(budgetMetrics(0, 0), { remaining: 0n, utilization: null, exceeded: false, progress: 0, color: '#15803d' });
  assert.equal(budgetMetrics(0, 1).progress, 100);
  assert.equal(budgetMetrics(0, 1).exceeded, true);
  assert.equal(budgetMetrics(100, 80).color, '#a16207');
  assert.equal(budgetMetrics(100, 100).utilization, '100.00');
  assert.equal(budgetMetrics(100, 101).utilization, '101.00');
  assert.equal(budgetMetrics(100, 101).remaining, -1n);
  assert.equal(budgetMetrics(100, 101).progress, 100);
  assert.equal(budgetMetrics(1, 9008000000000001n).remaining, -9008000000000000n);
});
test('calendar shifting handles leap years, ancient years and supported limits', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2024-03', -1), '2024-02');
  assert.equal(monthlyTotals([row('expense', 1, '2024-02-29')], '2024-02').expense, 1n);
  assert.equal(shiftMonth('0099-12', 1), '0100-01');
  assert.equal(shiftMonth('0001-01', -1), null);
  assert.equal(shiftMonth('9999-12', 1), null);
  assert.equal(sixMonthTotals([], '0001-01').length, 1);
  assert.equal(sixMonthTotals([], '9999-12').length, 6);
  assert.equal(monthlyComparison([], '0001-01').previousMonth, null);
  assert.match(monthLabel('0001-01'), /Jan/);
});
test('invalid month selections return safe empty results', () => {
  for (const month of ['', 'bad', '2026-13', '2026-1', '0000-01']) {
    assert.deepEqual(sixMonthTotals(records, month), []);
    assert.equal(monthlyTotals(records, month).income, 0n);
    assert.equal(shiftMonth(month, -1), null);
  }
});
