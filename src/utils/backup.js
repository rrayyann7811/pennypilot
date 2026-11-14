import { validDate } from './finance.js';
import { saveData } from './storage.js';

export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validAmount = (value, zero = false) => Number.isSafeInteger(value) && value >= (zero ? 0 : 1) && value <= 1000000000000;
const byteLength = text => new TextEncoder().encode(text).length;

export function createBackup(data, exportedAt = new Date().toISOString()) {
  const backup = {
    format: 'pennypilot-backup', version: BACKUP_VERSION, exportedAt,
    data: {
      transactions: data.transactions.map(item => ({
        id: item.id, title: item.title, amountPaise: item.amountPaise,
        type: item.type, date: item.date,
        ...(!validDate(item.date) ? { dateStatus: 'unresolved' } : {}),
      })),
      budgets: { ...data.budgets }, defaultBudget: data.defaultBudget,
    },
  };
  const text = JSON.stringify(backup, null, 2);
  // Every generated backup must also be accepted by the importer.
  parseBackup(text);
  return text;
}

export function parseBackup(text) {
  if (typeof text !== 'string') throw new Error('Backup contents must be text.');
  if (byteLength(text) > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 5 MiB size limit.');
  let raw;
  try { raw = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('Invalid JSON. Choose a PennyPilot JSON backup.'); }
  if (!isObject(raw) || raw.format !== 'pennypilot-backup') throw new Error('This is not a PennyPilot backup.');
  if (raw.version !== BACKUP_VERSION) throw new Error('Unsupported backup version.');
  if (typeof raw.exportedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(raw.exportedAt) || !Number.isFinite(Date.parse(raw.exportedAt)) || new Date(raw.exportedAt).toISOString() !== raw.exportedAt) throw new Error('Invalid backup export timestamp.');
  const data = raw.data;
  if (!isObject(data) || !Array.isArray(data.transactions) || !isObject(data.budgets) || !validAmount(data.defaultBudget, true)) throw new Error('Invalid backup data or default budget.');
  const ids = new Set();
  const transactions = data.transactions.map((item, index) => {
    const fail = message => { throw new Error(`Transaction ${index + 1}: ${message}`); };
    if (!isObject(item) || typeof item.id !== 'string') fail('invalid transaction ID.');
    if (ids.has(item.id)) fail('duplicate transaction ID.');
    ids.add(item.id);
    if (typeof item.title !== 'string' || !item.title.trim()) fail('invalid title.');
    if (!validAmount(item.amountPaise)) fail('amount must be positive integer paise within the supported limit.');
    if (!['income', 'expense'].includes(item.type)) fail('invalid transaction type.');
    // Only explicitly tagged legacy dates may stay unresolved. Never guess their meaning.
    if (typeof item.date !== 'string' || (item.dateStatus !== undefined && item.dateStatus !== 'unresolved') || (!validDate(item.date) && item.dateStatus !== 'unresolved') || (validDate(item.date) && item.dateStatus === 'unresolved')) fail('invalid date or legacy date marker.');
    return { id: item.id, title: item.title, amountPaise: item.amountPaise, type: item.type, date: item.date };
  });
  const budgets = {};
  for (const [month, amount] of Object.entries(data.budgets)) {
    if (!validDate(`${month}-01`) || !validAmount(amount, true)) throw new Error('Invalid monthly budget.');
    budgets[month] = amount;
  }
  return { transactions, budgets, defaultBudget: data.defaultBudget };
}

export async function readBackupFile(file) {
  if (!file || typeof file.name !== 'string' || !/\.json$/i.test(file.name)) throw new Error('Choose a .json backup file.');
  if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 5 MiB size limit.');
  let text;
  try { text = await file.text(); } catch { throw new Error('The backup file could not be read. Please try again.'); }
  // Recheck actual decoded bytes, not just the file metadata.
  return parseBackup(text);
}

export function restoreBackup(storage, data, confirmed = false) {
  if (confirmed !== true) return { ok: false, cancelled: true };
  // Revalidate the staged copy before a single atomic localStorage write.
  const validated = parseBackup(createBackup(data));
  if (!saveData(storage, validated)) throw new Error('Restore failed: browser storage is unavailable or full. Existing app data was not replaced.');
  return { ok: true, data: validated };
}

function csvCell(value) {
  let text = String(value);
  // Quoting alone does not neutralize spreadsheet formulas. Protect every text column.
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function transactionsCsv(transactions) {
  const rows = [['Transaction Title', 'Amount (INR)', 'Transaction Type', 'Transaction Date']];
  for (const item of transactions) {
    const paise = BigInt(item.amountPaise);
    rows.push([item.title, `${paise / 100n}.${String(paise % 100n).padStart(2, '0')}`, item.type, item.date]);
  }
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export function downloadText(text, filename, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  try { anchor.click(); } finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
