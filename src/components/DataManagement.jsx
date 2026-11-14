import { useEffect, useRef, useState } from 'react';
import { validDate } from '../utils/finance';
import { createBackup, downloadText, readBackupFile, transactionsCsv } from '../utils/backup';

export default function DataManagement({ data, onRestore }) {
  const [pending, setPending] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(false);
  const [reading, setReading] = useState(false);
  const fileInput = useRef(null);
  const cancelButton = useRef(null);
  const request = useRef(0);
  useEffect(() => { if (pending) cancelButton.current?.focus(); }, [pending]);
  const message = (text, failed = false) => { setStatus(text); setError(failed); };
  const exportFile = format => {
    try {
      const stamp = new Date().toISOString().replaceAll(':', '-');
      if (format === 'csv') downloadText(transactionsCsv(data.transactions), `pennypilot-transactions-${stamp}.csv`, 'text/csv;charset=utf-8');
      else downloadText(createBackup(data), `pennypilot-backup-${stamp}.json`, 'application/json;charset=utf-8');
      message('Download requested. Check your browser downloads.');
    } catch (failure) { message(failure.message || 'The file could not be exported.', true); }
  };
  const chooseFile = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const current = ++request.current;
    setPending(null);
    if (!file) { setReading(false); return; }
    setReading(true); message('Reading and validating backup…');
    try {
      const next = await readBackupFile(file);
      if (current !== request.current) return;
      setPending(next); message('Backup validated. Review the replacement below.');
    } catch (failure) { if (current === request.current) message(failure.message || 'The file could not be read.', true); }
    finally { if (current === request.current) setReading(false); }
  };
  const cancel = () => { request.current++; setPending(null); setReading(false); message('Import cancelled. Existing data was not changed.'); fileInput.current?.focus(); };
  const restore = () => {
    try {
      onRestore(pending);
      setPending(null); message('Backup restored successfully. Transactions and budgets have been replaced.'); fileInput.current?.focus();
    } catch (failure) { message(failure.message || 'Restore failed. Existing data was not replaced.', true); }
  };
  return <section className="card data-management" aria-labelledby="data-heading">
    <div className="data-header"><div><h2 id="data-heading">Data Management</h2><p className="analytics-note">Download a backup or restore your transactions and budgets.</p></div></div>
    <div className="data-actions"><button onClick={() => exportFile('csv')}>Export CSV</button><button onClick={() => exportFile('json')}>Download JSON Backup</button><div className="backup-file"><label htmlFor="backup-file">Import JSON Backup</label><input ref={fileInput} id="backup-file" type="file" accept=".json,application/json" onChange={chooseFile} aria-describedby="backup-help" disabled={reading} /></div></div>
    <p id="backup-help" className="analytics-note">JSON only, up to 5 MiB. Restore replaces all transactions and budgets after confirmation. CSV is for viewing, not restoring.</p>
    {status && <p className={error ? 'error backup-status' : 'backup-status'} role={error ? 'alert' : 'status'}>{status}</p>}
    {pending && <div className="import-confirmation" role="region" aria-labelledby="restore-heading"><h3 id="restore-heading">Confirm backup restore</h3><p>{pending.transactions.length} transaction(s) and {Object.keys(pending.budgets).length} monthly budget(s) found.</p><p>This will replace all existing app transactions, monthly budgets, and the default budget, including transactions hidden by filters. Download a JSON backup first if you want to keep your current data. Original legacy storage keys are retained.</p>{pending.transactions.some(item => !validDate(item.date)) && <p>Legacy dates needing review will remain unresolved.</p>}<div className="confirmation-actions"><button ref={cancelButton} onClick={cancel}>Cancel</button><button className="restore-btn" onClick={restore}>Confirm Restore</button></div></div>}
  </section>;
}
