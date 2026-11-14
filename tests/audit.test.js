import test from 'node:test';
import assert from 'node:assert/strict';
import { loadData, STORAGE_KEY } from '../src/utils/storage.js';
import { createBackup, parseBackup, restoreBackup } from '../src/utils/backup.js';

const transaction = { id: 'one', title: 'Example', amountPaise: 1, type: 'expense', date: '2026-11-14' };
const data = { transactions: [transaction], budgets: {}, defaultBudget: 1000000 };

test('large stored histories retain every row while repairing special, missing and duplicate IDs', () => {
  const rows = Array.from({ length: 10000 }, (_, index) => ({ ...transaction, id: String(index) }));
  rows.push({ ...transaction, id: '__proto__' }, { ...transaction, id: '__proto__' }, { ...transaction, id: undefined });
  const saved = JSON.stringify({ version: 1, ...data, transactions: rows });
  const local = { getItem: () => saved, setItem: () => assert.fail('Loading must not write') };
  const loaded = loadData(local);
  assert.equal(loaded.writable, true);
  assert.equal(loaded.data.transactions.length, 10003);
  assert.equal(new Set(loaded.data.transactions.map(item => item.id)).size, 10003);
  assert.equal(loaded.data.transactions[10000].id, '__proto__');
  assert.ok(loaded.data.transactions.every(item => item.amountPaise === 1));
});

test('prototype-shaped budget keys reject the whole restore without writing', () => {
  const raw = JSON.parse(createBackup(data));
  raw.data.budgets = JSON.parse('{"__proto__":{"polluted":true}}');
  let writes = 0;
  const values = { [STORAGE_KEY]: 'original', transactions: 'legacy' };
  const local = { setItem(key, value) { writes++; values[key] = value; } };
  assert.throws(() => parseBackup(JSON.stringify(raw)), /budget/);
  assert.throws(() => restoreBackup(local, raw.data, true), /budget/);
  assert.equal(writes, 0);
  assert.deepEqual(values, { [STORAGE_KEY]: 'original', transactions: 'legacy' });
  assert.equal({}.polluted, undefined);
});

test('imported unknown fields cannot enter persisted app data or pollute prototypes', () => {
  const raw = JSON.parse(createBackup(data));
  raw.data.transactions[0] = JSON.parse(JSON.stringify(transaction).slice(0, -1) + ',"__proto__":{"polluted":true},"html":"<script>bad()</script>"}');
  raw.data.unrelatedSecret = 'discard';
  const imported = parseBackup(JSON.stringify(raw));
  assert.deepEqual(imported, data);
  assert.equal({}.polluted, undefined);
});
