/**
 * Tiny CSV export helper — keeps tables exportable without pulling a library.
 * Escapes the RFC 4180 quote/comma/newline triad and triggers a download.
 */

export type CsvColumn<T> = {
  header: string;
  /** Return any primitive — null/undefined render as empty. */
  value: (row: T) => string | number | boolean | null | undefined;
};

function escape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escape(c.header)).join(',');
  const body = rows.map((r) => columns.map((c) => escape(c.value(r))).join(','));
  // BOM so Excel opens UTF-8 (Arabic) correctly without re-encoding.
  return '﻿' + [header, ...body].join('\r\n');
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const csv = rowsToCsv(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
