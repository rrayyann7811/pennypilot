import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackup, parseBackup, readBackupFile, restoreBackup, transactionsCsv, MAX_BACKUP_BYTES } from '../src/utils/backup.js';
import { loadData, STORAGE_KEY } from '../src/utils/storage.js';
const data = () => ({ transactions: [{ id: 'one', title: 'Lunch', amountPaise: 1234, type: 'expense', date: '2026-11-14' }], budgets: { '2026-11': 0, '2026-12': 10050 }, defaultBudget: 1000000 });
const raw = () => JSON.parse(createBackup(data(), '2026-11-14T10:00:00.000Z'));
const store = () => { const values = { [STORAGE_KEY]: 'original', transactions: 'legacy original', budget: 'old budget' }; return { values, calls: 0, getItem(key) { return values[key] ?? null; }, setItem(key, value) { this.calls++; values[key] = value; } }; };
const parse = value => parseBackup(JSON.stringify(value));

test('CSV includes readable headings, CRLF, exact decimal INR, and BOM', () => {
  const csv = transactionsCsv(data().transactions);
  assert.equal(csv, '\uFEFF"Transaction Title","Amount (INR)","Transaction Type","Transaction Date"\r\n"Lunch","12.34","expense","2026-11-14"\r\n');
  assert.ok(transactionsCsv([]).includes('Transaction Title'));
});
test('CSV escapes commas, quotation marks, multiline and Unicode titles', () => {
  const csv = transactionsCsv([{ ...data().transactions[0], title: 'चाय, "café" 🪙\nLunch' }]);
  assert.ok(csv.includes('"चाय, ""café"" 🪙\nLunch"'));
});
test('CSV neutralizes formula prefixes including leading whitespace/control characters', () => {
  for (const title of ['=SUM(A1)', '+1', '-1', '@cmd', '  =1', '\t=1', '\r=1', '\n=1', '\uFEFF=1', '\u0000=1']) {
    const csv = transactionsCsv([{ ...data().transactions[0], title, date: '=legacy()' }]);
    assert.ok(csv.includes(`"'${title}"`), title);
    assert.ok(csv.includes('"\'=legacy()"'));
  }
});
test('CSV preserves one paise and maximum amounts without exponent notation', () => {
  const rows = [1, 10, 999999999999, 1000000000000].map(amountPaise => ({ ...data().transactions[0], amountPaise }));
  const csv = transactionsCsv(rows);
  for (const amount of ['0.01', '0.10', '9999999999.99', '10000000000.00']) assert.ok(csv.includes(`"${amount}"`));
});
test('JSON backup contains version, timestamp and complete application state only', () => {
  const source = data(); source.transactions[0].extra = 'not needed'; source.secret = 'do not export';
  const backup = JSON.parse(createBackup(source, '2026-11-14T10:00:00.000Z'));
  assert.deepEqual(Object.keys(backup), ['format', 'version', 'exportedAt', 'data']);
  assert.equal(backup.version, 1);
  assert.equal(backup.exportedAt, '2026-11-14T10:00:00.000Z');
  assert.equal(backup.data.secret, undefined); assert.equal(backup.data.transactions[0].extra, undefined);
  assert.deepEqual(parseBackup(JSON.stringify(backup)), data());
});
test('valid backup restores atomically to current schema without touching legacy keys', () => {
  const local = store();
  const result = restoreBackup(local, parseBackup(createBackup(data())), true);
  assert.equal(result.ok, true); assert.equal(local.calls, 1);
  assert.deepEqual(loadData(local).data, data());
  assert.equal(local.values.transactions, 'legacy original'); assert.equal(local.values.budget, 'old budget');
});
test('unresolved legacy dates round-trip unchanged and remain excluded from monthly tracking', () => {
  const source = data(); source.transactions[0].date = '11/12/2026';
  const exported = JSON.parse(createBackup(source));
  assert.equal(exported.data.transactions[0].dateStatus, 'unresolved');
  const restored = parse(exported); assert.deepEqual(restored, source);
  const local = store(); restoreBackup(local, restored, true);
  assert.equal(loadData(local).data.transactions[0].date, '11/12/2026');
  source.transactions[0].date = '2026-02-30'; assert.deepEqual(parseBackup(createBackup(source)), source);
});
test('invalid JSON, root objects, signatures and unsupported versions are rejected', () => {
  for (const text of ['{', '', 'null', '[]', '{}', 'true']) assert.throws(() => parseBackup(text));
  for (const version of [0, 2, '1', null]) { const backup = raw(); backup.version = version; assert.throws(() => parse(backup), /version/); }
});
test('invalid timestamps are rejected', () => {
  for (const stamp of ['bad', '', null, '2026-02-30T10:00:00.000Z', '2026-11-14']) { const backup = raw(); backup.exportedAt = stamp; assert.throws(() => parse(backup), /timestamp/); }
});
test('duplicate and invalid IDs or titles are rejected without merging rows', () => {
  const backup = raw(); backup.data.transactions.push({ ...backup.data.transactions[0] });
  assert.throws(() => parse(backup), /duplicate/);
  for (const [field, value] of [['id', 123], ['id', null], ['title', ' '], ['title', 123]]) { const invalid = raw(); invalid.data.transactions[0][field] = value; assert.throws(() => parse(invalid)); }
});
test('invalid dates, types and unresolved markers are rejected', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '', 12, '11/12/2026', '0000-01-01']) { const backup = raw(); backup.data.transactions[0].date = date; assert.throws(() => parse(backup), /date/); }
  for (const type of ['other', '', null]) { const backup = raw(); backup.data.transactions[0].type = type; assert.throws(() => parse(backup), /type/); }
  for (const marker of ['resolved', null, 'unresolved']) { const backup = raw(); backup.data.transactions[0].dateStatus = marker; assert.throws(() => parse(backup), /date/); }
});
test('invalid amounts and budget shapes/values are rejected', () => {
  for (const amount of [0, -1, 1.1, '100', null, 1000000000001, Number.MAX_SAFE_INTEGER + 1]) { const backup = raw(); backup.data.transactions[0].amountPaise = amount; assert.throws(() => parse(backup), /amount/); }
  for (const amount of [-1, .5, '100', null, 1000000000001]) {
    const backup = raw(); backup.data.defaultBudget = amount; assert.throws(() => parse(backup), /budget/);
    const monthly = raw(); monthly.data.budgets['2026-11'] = amount; assert.throws(() => parse(monthly), /budget/);
  }
  for (const budgets of [[], null, { '2026-13': 1 }, { '__bad': 1 }]) { const backup = raw(); backup.data.budgets = budgets; assert.throws(() => parse(backup), /budget/); }
  for (const transactions of [null, {}, [null]]) { const backup = raw(); backup.data.transactions = transactions; assert.throws(() => parse(backup)); }
});
test('maximum amounts, Unicode, leap dates and calendar boundaries round-trip exactly', () => {
  const source = data(); source.transactions[0] = { ...source.transactions[0], id: '旧-id', title: '工资 🪙', amountPaise: 1000000000000, date: '2024-02-29' };
  source.budgets = { '0001-01': 0, '9999-12': 1000000000000 }; source.defaultBudget = 0;
  assert.deepEqual(parseBackup(createBackup(source)), source);
});
test('empty backups are valid and can intentionally replace history and budgets', () => {
  const empty = { transactions: [], budgets: {}, defaultBudget: 0 };
  const local = store(); assert.deepEqual(restoreBackup(local, empty, true).data, empty);
});
test('cancelled or missing confirmation never writes or validates replacement data', () => {
  const local = store(); const before = { ...local.values };
  for (const confirmation of [undefined, false, 'true', 1]) assert.deepEqual(restoreBackup(local, null, confirmation), { ok: false, cancelled: true });
  assert.equal(local.calls, 0); assert.deepEqual(local.values, before);
});
test('failed validation and failed storage writes preserve every original storage value', () => {
  const local = store(); const before = { ...local.values };
  const invalid = data(); invalid.transactions.push({ ...invalid.transactions[0] });
  assert.throws(() => restoreBackup(local, invalid, true)); assert.equal(local.calls, 0); assert.deepEqual(local.values, before);
  local.setItem = () => { throw Error('quota'); };
  assert.throws(() => restoreBackup(local, data(), true), /Existing app data was not replaced/);
  assert.deepEqual(local.values, before);
  assert.throws(() => restoreBackup(null, data(), true), /unavailable/);
});
test('file reading enforces JSON extension, maximum size, actual byte size and read errors', async () => {
  let read = false;
  await assert.rejects(readBackupFile({ name: 'backup.csv', size: 1, text: async () => { read = true; } }), /\.json/);
  await assert.rejects(readBackupFile({ name: 'backup.json', size: MAX_BACKUP_BYTES + 1, text: async () => { read = true; } }), /5 MiB/);
  assert.equal(read, false);
  await assert.rejects(readBackupFile({ name: 'backup.json', size: 1, text: async () => { throw Error('read failed'); } }), /could not be read/);
  await assert.rejects(readBackupFile({ name: 'backup.json', size: 1, text: async () => '🪙'.repeat(MAX_BACKUP_BYTES / 4 + 1) }), /5 MiB/);
  const text = createBackup(data());
  assert.deepEqual(await readBackupFile({ name: 'backup.JSON', size: text.length, text: async () => text }), data());
});
test('oversized generated backups are rejected, and BOM-prefixed JSON is accepted', () => {
  assert.throws(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1)), /5 MiB/);
  const source = data(); source.transactions[0].title = 'x'.repeat(MAX_BACKUP_BYTES);
  assert.throws(() => createBackup(source), /5 MiB/);
  assert.deepEqual(parseBackup('\uFEFF' + createBackup(data())), data());
});
