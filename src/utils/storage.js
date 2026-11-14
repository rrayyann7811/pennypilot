import { newId, parseAmount, validDate } from './finance.js';
export const STORAGE_KEY = 'pennypilot.phase1.v1';
const empty = () => ({ transactions: [], budgets: {}, defaultBudget: 1000000 });
export function loadData(storage) {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    const legacy = saved === null;
    const raw = legacy ? { transactions: JSON.parse(storage.getItem('transactions') || '[]'), budget: storage.getItem('budget') } : JSON.parse(saved);
    if (!raw || !Array.isArray(raw.transactions) || (!legacy && raw.version !== 1)) throw new Error('Unrecognized saved data');
    const transactions = [];
    const ids = new Set();
    let skipped = 0;
    for (const item of raw.transactions) {
      const amountPaise = legacy ? parseAmount(item?.amount) : item?.amountPaise;
      if (!item || typeof item.title !== 'string' || !item.title.trim() || !['income', 'expense'].includes(item.type) || !Number.isSafeInteger(amountPaise) || amountPaise <= 0 || amountPaise > 1000000000000 || typeof item.date !== 'string') { skipped++; continue; }
      let id = typeof item.id === 'string' || typeof item.id === 'number' ? String(item.id) : newId(ids);
      if (ids.has(id)) id = newId(ids);
      ids.add(id);
      transactions.push({ ...item, id, amountPaise });
    }
    const budgets = legacy ? {} : raw.budgets;
    if (!budgets || typeof budgets !== 'object' || Array.isArray(budgets) || Object.entries(budgets).some(([month, amount]) => !validDate(`${month}-01`) || !Number.isSafeInteger(amount) || amount < 0 || amount > 1000000000000)) throw new Error('Invalid budgets');
    const defaultBudget = legacy ? (raw.budget === null ? 1000000 : parseAmount(raw.budget, true)) : raw.defaultBudget;
    if (!Number.isSafeInteger(defaultBudget) || defaultBudget < 0 || defaultBudget > 1000000000000) throw new Error('Invalid budget');
    return { data: { transactions, budgets, defaultBudget }, writable: skipped === 0, warning: skipped ? `${skipped} invalid saved transaction(s) could not be loaded. Saving is disabled to protect the original data.` : '' };
  } catch {
    return { data: empty(), writable: false, warning: 'Saved data could not be read. Saving is disabled to protect existing data. You can use this session, but changes will not persist.' };
  }
}
export function saveData(storage, data) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...data })); return true; } catch { return false; }
}
