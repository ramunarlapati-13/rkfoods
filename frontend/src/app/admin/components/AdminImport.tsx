'use client';
import { useState, useRef } from 'react';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ParsedRow {
  name: string;
  category: string;
  actualPrice: string;
  sellingPrice: string;
  [key: string]: string;
}

export default function AdminImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(false);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      // Dynamic import so xlsx isn't bundled always
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<ParsedRow>(ws, { defval: '' });
      setRows(json);
      toast.success(`Loaded ${json.length} rows from ${file.name}`);
    } else {
      toast.error('Only .xlsx / .xls files are supported for import.');
    }
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      let count = 0;
      for (const row of rows) {
        const { error } = await supabase.from('products').insert({
          name: row.name || row.Name || '',
          category: (row.category || row.Category || 'pickles').toLowerCase(),
          actual_price: Number(row.actualPrice || row['Actual Price'] || 0),
          selling_price: Number(row.sellingPrice || row['Selling Price'] || 0),
          sku: `RKF${Math.floor(100000 + Math.random() * 900000)}`, // Generate 6-digit random SKU suffix to ensure uniqueness
          in_stock: true,
        });
        if (error) throw error;
        count++;
      }
      toast.success(`${count} products imported successfully!`);
      setDone(true);
      setRows([]);
    } catch (err) {
      toast.error('Import failed — check Firebase config.');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Bulk Import Products</h2>

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="card border-2 border-dashed p-12 text-center cursor-pointer hover:border-ochre/60 transition-colors mb-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <FiUpload size={40} className="mx-auto mb-4 text-ochre" />
        <p className="font-display font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
          {fileName || 'Click to upload an Excel file'}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Supports .xlsx and .xls</p>
        <input
          ref={inputRef}
          id="admin-import-file-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <div className="card overflow-hidden mb-6">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Preview — {rows.length} rows
            </p>
            <button
              id="admin-confirm-import-btn"
              onClick={handleImport}
              disabled={importing}
              className="btn-primary text-sm py-2 flex items-center gap-2"
            >
              {importing ? 'Importing…' : `Import ${rows.length} Products`}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {Object.keys(rows[0]).map((k) => (
                    <th key={k} className="text-left px-3 py-2 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2 truncate max-w-[140px]" style={{ color: 'var(--text-primary)' }}>{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="flex items-center gap-3 text-green-400 card p-4">
          <FiCheckCircle size={20} />
          <span className="font-medium">Import complete! Products are now in Firestore.</span>
        </div>
      )}

      {/* Format guide */}
      <div className="card p-6 mt-6">
        <div className="flex items-center gap-2 mb-3 text-ochre">
          <FiAlertCircle size={16} />
          <span className="font-semibold text-sm">Expected column headers</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['name', 'category', 'actualPrice', 'sellingPrice', 'description', 'ingredients', 'rating', 'inStock'].map((col) => (
            <code key={col} className="text-xs px-2 py-1 rounded-lg bg-ochre/10 text-ochre">{col}</code>
          ))}
        </div>
      </div>
    </div>
  );
}
