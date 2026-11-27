import { useEffect, useState } from 'react';
import { parseCsv, type CsvRow } from '../../utils/csv';

/**
 * Fetches a published Google Sheet CSV in the browser and maps it to rows.
 * Runs client-side so sheet edits show up without rebuilding the site.
 */
export function useCsv<T>(url: string, transform: (rows: CsvRow[]) => T[]): T[] {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setRows(transform(parseCsv(text)));
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
    // `transform` is expected to be a stable, module-level function.
  }, [url]);
  return rows;
}
