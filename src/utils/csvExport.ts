export function exportCSV(filename: string, headers: string[], rows: string[][]): void {
  const bom = '﻿';
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    row.map((cell) => {
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(','),
  );
  const csv = bom + [headerLine, ...dataLines].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
