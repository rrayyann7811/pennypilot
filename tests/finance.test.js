import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, validDate, validateTransaction, totals, filterTransactions, formatMoney, newId } from '../src/utils/finance.js';
import { loadData, saveData, STORAGE_KEY } from '../src/utils/storage.js';
const transaction = { id: '1', title: 'Lunch', amountPaise: 1025, type: 'expense', date: '2026-11-14' };
const storage = (values = {}) => ({ getItem: key => values[key] ?? null, setItem: (key, value) => { values[key] = value; }, values });
test('amounts use exact paise and reject invalid inputs', () => {
  assert.equal(parseAmount('0.10'), 10); assert.equal(parseAmount('12.34'), 1234);
  for (const value of ['-1', '0', '1.234', 'NaN', '', '1e3', 'Infinity', '10000000001']) assert.equal(parseAmount(value), null);
  assert.equal(parseAmount('0', true), 0);
});
test('financial totals and Indian formatting', () => {
  const items = [{ ...transaction, amountPaise: 10 }, { ...transaction, amountPaise: 20 }, { ...transaction, type: 'income', amountPaise: 100 }];
  assert.deepEqual(totals(items), { income: 100, expense: 30, balance: 70 });
  assert.match(formatMoney(12345678), /1,23,456.78/);
});
test('date validation handles leap years and invalid days', () => {
  assert.equal(validDate('2024-02-29'), true);
  for (const date of ['2026-02-29', '2026-04-31', '11/12/2026', '', '0000-01-01']) assert.equal(validDate(date), false);
});
test('validates every transaction field', () => {
  assert.deepEqual(validateTransaction({ title: 'Lunch', amount: '10.25', type: 'expense', date: transaction.date }), {});
  assert.deepEqual(Object.keys(validateTransaction({ title: ' ', amount: '-1', type: 'other', date: 'bad' })), ['title', 'amount', 'type', 'date']);
  assert.ok(validateTransaction({ title: 'a'.repeat(101), amount: '1', type: 'income', date: transaction.date }).title);
});
const items = [transaction, { ...transaction, id: '2', title: 'Salary', type: 'income', amountPaise: 50000, date: '2026-10-01' }, { ...transaction, id: '3', title: 'lunch outside', date: '2026-11-01', amountPaise: 2000 }, { ...transaction, id: '4', date: '11/12/2026' }];
test('month, search and type filters combine without changing input', () => {
  assert.deepEqual(filterTransactions(items, { month: '2026-11', search: ' LUNCH ', type: 'expense', sort: 'oldest' }).map(item => item.id), ['3', '1']);
  assert.equal(items[0].id, '1');
  assert.equal(totals(filterTransactions(items, { month: '2026-11' })).expense, 3025);
  assert.equal(filterTransactions(items, { month: '2026-12' }).length, 0);
});
test('all sorting modes and unresolved date ordering', () => {
  assert.equal(filterTransactions(items, { sort: 'newest' })[0].id, '1');
  assert.equal(filterTransactions(items, { sort: 'oldest' })[0].id, '2');
  assert.equal(filterTransactions(items, { sort: 'highest' })[0].id, '2');
  assert.equal(filterTransactions(items, { sort: 'lowest' })[0].amountPaise, 1025);
  assert.equal(filterTransactions(items).at(-1).id, '4');
});
test('legacy data migrates without guessing dates or overwriting originals', () => {
  const original = JSON.stringify([{ id: 1, title: 'Lunch', amount: 10.25, type: 'expense', date: '11/12/2026' }, { id: 1, title: 'Other', amount: 1, type: 'income', date: '2026-11-01' }]);
  const local = storage({ transactions: original, budget: '100.50' });
  const result = loadData(local);
  assert.equal(result.writable, true); assert.equal(result.data.defaultBudget, 10050);
  assert.equal(result.data.transactions[0].date, '11/12/2026'); assert.equal(result.data.transactions[0].amountPaise, 1025);
  assert.notEqual(result.data.transactions[0].id, result.data.transactions[1].id);
  assert.equal(saveData(local, result.data), true); assert.equal(local.values.transactions, original);
  assert.deepEqual(loadData(local).data, result.data);
});
test('malformed, invalid and unavailable storage is safe', () => {
  for (const values of [{ transactions: '{' }, { transactions: '{}' }, { [STORAGE_KEY]: '{' }, { budget: '-1' }, { [STORAGE_KEY]: JSON.stringify({ version: 2, transactions: [] }) }]) {
    const result = loadData(storage(values)); assert.equal(result.writable, false); assert.ok(result.warning);
  }
  const broken = { getItem() { throw Error('blocked'); }, setItem() { throw Error('quota'); } };
  assert.equal(loadData(broken).writable, false); assert.equal(saveData(broken, {}), false);
});
test('invalid saved rows are preserved and saving is disabled', () => {
  const local = storage({ transactions: JSON.stringify([{ title: 'Bad', amount: -1 }, { title: 'Good', amount: 1, type: 'income', date: 'unknown' }]) });
  const before = local.values.transactions;
  const result = loadData(local); assert.equal(result.data.transactions.length, 1); assert.equal(result.writable, false); assert.equal(local.values.transactions, before);
});
test('new storage starts with defaults and IDs are unique', () => {
  assert.equal(loadData(storage()).data.defaultBudget, 1000000);
  const id = newId(items); assert.ok(!items.some(item => item.id === id));
});
test('large cumulative totals and formatting preserve every paise', () => {
  const rows = Array.from({ length: 9008 }, () => ({ ...transaction, amountPaise: 1000000000000 }));
  rows.push({ ...transaction, amountPaise: 1 });
  const result = totals(rows);
  assert.equal(result.expense, 9008000000000001n);
  assert.equal(result.balance, -9008000000000001n);
  assert.equal(formatMoney(result.expense), '₹9,00,80,00,00,00,000.01');
  assert.equal(formatMoney(-1), '-₹0.01');
  assert.equal(formatMoney(0), '₹0.00');
});
test('maximum amounts and year boundaries retain exact values', () => {
  assert.equal(parseAmount('10000000000.00'), 1000000000000);
  assert.equal(parseAmount('9999999999.99'), 999999999999);
  assert.equal(parseAmount('10000000000.01'), null);
  assert.equal(validDate('0001-01-01'), true);
  assert.equal(validDate('9999-12-31'), true);
  assert.equal(validDate('1900-02-29'), false);
  assert.equal(validDate('2000-02-29'), true);
});
test('duplicate saved IDs are repaired without merging transactions', () => {
  const local = storage({ [STORAGE_KEY]: JSON.stringify({ version: 1, transactions: [transaction, transaction], budgets: { '2026-11': 0, '2026-12': 12345 }, defaultBudget: 1000000 }) });
  const result = loadData(local);
  assert.equal(result.writable, true);
  assert.equal(result.data.transactions.length, 2);
  assert.notEqual(result.data.transactions[0].id, result.data.transactions[1].id);
  assert.equal(saveData(local, result.data), true);
  assert.deepEqual(loadData(local).data, result.data);
});
