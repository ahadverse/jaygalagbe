/**
 * CSV serialisation for the admin export endpoints.
 *
 * Exports are opened in Excel and Google Sheets, so a cell starting with
 * `=`, `+`, `-`, `@`, tab or CR is a formula to those programs — an advertiser
 * could name a listing `=HYPERLINK(...)` and have it execute in an operator's
 * spreadsheet. Every value is neutralised before quoting.
 */

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text = value instanceof Date ? value.toISOString() : String(value);

  if (FORMULA_PREFIX.test(text)) {
    text = `'${text}`;
  }

  // RFC 4180: quote anything holding a delimiter, quote or newline, and double
  // up embedded quotes.
  if (/["\n\r,]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((column) => escapeCell(column.header)).join(',')];

  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(column.value(row))).join(','));
  }

  // A UTF-8 BOM so Excel on Windows reads Bangla text and the ৳ sign correctly.
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** `ads-2026-09-21.csv` — dated so repeated exports do not overwrite. */
export function csvFilename(resource: string): string {
  return `${resource}-${new Date().toISOString().slice(0, 10)}.csv`;
}

/** Hard ceiling on an export so one request cannot stream the whole table. */
export const MAX_EXPORT_ROWS = 5_000;
