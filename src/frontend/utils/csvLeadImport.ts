/**
 * Shared CSV → Lead mapping and batch constants for leads import.
 * Used by CsvImportModal and /leads/import page.
 */

import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';

export const COMMIT_BATCH_SIZE = 5000;

/** Quote char used when retrying with quote handling disabled. */
const FALLBACK_QUOTE_CHAR = '\u0001';

function isQuoteError(err: { type?: string; message?: string }): boolean {
  const msg = (err.message || '').toLowerCase();
  const type = (err.type || '').toLowerCase();
  return type === 'quotes' || msg.includes('quote') || msg.includes('malformed');
}

function isFieldCountError(err: { code?: string; message?: string }): boolean {
  const msg = (err.message || '').toLowerCase();
  return msg.includes('too few fields') || msg.includes('too many fields');
}

/**
 * Normalize parsed rows so each has exactly the header's fields (pad missing with '', drop extras).
 * Removes field-count errors from the result so validation can pass for off-by-one rows.
 */
function normalizeRowFieldCounts(result: ParseResult<any>): void {
  const fields = result.meta?.fields;
  if (!fields?.length || !result.data?.length) return;

  for (const row of result.data as Record<string, unknown>[]) {
    for (const f of fields) {
      if (!Object.prototype.hasOwnProperty.call(row, f)) {
        row[f] = '';
      }
    }
    for (const key of Object.keys(row)) {
      if (key !== '__parsed_extra' && !fields.includes(key)) {
        delete row[key];
      }
    }
    const extra = (row as { __parsed_extra?: unknown }).__parsed_extra;
    if (extra !== undefined) delete (row as { __parsed_extra?: unknown }).__parsed_extra;
  }

  if (result.errors?.length) {
    result.errors = result.errors.filter((e) => !isFieldCountError(e));
  }
}

/**
 * Preprocess CSV: double unescaped interior quotes so the default parser can handle them.
 * When inside a quoted field, a " not followed by ", comma, or newline is treated as
 * literal and escaped as "".
 */
function fixInteriorQuotes(csv: string): string {
  let out = '';
  let inQuoted = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    const next = csv[i + 1];
    if (c === '"') {
      if (!inQuoted) {
        inQuoted = true;
        out += c;
      } else {
        if (next === '"') {
          out += '""';
          i++;
        } else if (next === ',' || next === '\n' || next === '\r' || next === undefined) {
          out += c;
          inQuoted = false;
        } else {
          out += '""';
        }
      }
    } else {
      out += c;
    }
  }
  return out;
}

/**
 * Parse CSV with lenient quote handling:
 * 1. Parse with default options.
 * 2. If a quote error (e.g. "Trailing quote on quoted field is malformed"), try parsing
 *    after fixing unescaped interior quotes.
 * 3. If that still fails with a quote error, retry with quote handling disabled; only use
 *    that result if the retry has zero errors (otherwise we can get "Too few fields" when
 *    quoted fields contain newlines).
 */
export function parseCsvLenient(
  csvString: string,
  config: Record<string, unknown> = {},
): ParseResult<any> {
  const baseConfig = { header: true, skipEmptyLines: true, ...config };
  let result = Papa.parse(csvString, baseConfig);

  const hasQuoteError = result.errors?.some(isQuoteError);
  if (hasQuoteError && result.errors?.length) {
    const fixed = fixInteriorQuotes(csvString);
    const fixedResult = Papa.parse(fixed, baseConfig);
    if (!fixedResult.errors?.some(isQuoteError) && fixedResult.data?.length) {
      normalizeRowFieldCounts(fixedResult);
      return fixedResult;
    }

    const retry = Papa.parse(csvString, {
      ...baseConfig,
      quoteChar: FALLBACK_QUOTE_CHAR,
      escapeChar: FALLBACK_QUOTE_CHAR,
    });
    if (retry.errors?.length === 0 && retry.data?.length) {
      return retry;
    }
  }

  normalizeRowFieldCounts(result);
  return result;
}
export const MAX_AGGREGATED_ERRORS = 500;

/** PDR Deals (pdr_deals.csv) preset: CSV header -> lead field path */
export const PRESET_PDR_DEALS_CSV: Record<string, string> = {
  dealid: 'customFields.external.dealid',
  status: 'status',
  LeadSource: 'source',
  SubSource: 'customFields.subSource',
  ClientName: 'firstName+lastName',
  StreetAddress: 'address.street',
  City: 'address.city',
  State: 'address.state',
  ZipCode: 'address.zipCode',
  HomePhone: 'phone',
  SecondaryPhone: 'phone',
  EmailAddress: 'email',
  EmailAddress2: 'email',
  ListPrice: 'estimatedValue',
  datecr: 'customFields.datecr',
  leadscore: 'score',
  notes: 'notes',
  property_notes: 'notes',
  link_google: 'customFields.links',
  link_zillow: 'customFields.links',
  z_link: 'customFields.links',
  photos_link: 'customFields.links',
  link1: 'customFields.links',
  link2: 'customFields.links',
  link3: 'customFields.links',
  link4: 'customFields.links',
  link5: 'customFields.links',
  link6: 'customFields.links',
  link7: 'customFields.links',
  link8: 'customFields.links',
  link9: 'customFields.links',
  link10: 'customFields.links',
  link11: 'customFields.links',
  link12: 'customFields.links',
};

/** Turnkey/PDR Deals CSV preset */
export const PRESET_TURNKEY_PDR_DEALS_CSV: Record<string, string> = {
  ClientName: 'firstName+lastName',
  EmailAddress: 'email',
  EmailAddress2: 'email',
  HomePhone: 'phone',
  SecondaryPhone: 'phone',
  StreetAddress: 'address.street',
  City: 'address.city',
  State: 'address.state',
  ZipCode: 'address.zipCode',
  status: 'status',
  LeadSource: 'source',
  SubSource: 'customFields.subSource',
  notes: 'notes',
  property_notes: 'notes',
  leadscore: 'score',
  dealid: 'customFields.dealId',
  link_google: 'customFields.links',
  link_zillow: 'customFields.links',
  z_link: 'customFields.links',
  photos_link: 'customFields.links',
  link1: 'customFields.links',
  link2: 'customFields.links',
  link3: 'customFields.links',
  link4: 'customFields.links',
  link5: 'customFields.links',
  link6: 'customFields.links',
  link7: 'customFields.links',
  link8: 'customFields.links',
  link9: 'customFields.links',
  link10: 'customFields.links',
  link11: 'customFields.links',
  link12: 'customFields.links',
};

const LEAD_STATUS_VALUES = ['NEW', 'CONTACTED', 'APPT_SET', 'OFFER_SENT', 'UNDER_CONTRACT', 'DEAD', 'NURTURE', 'FOLLOW_UP', 'QUALIFIED', 'CONVERTED', 'LOST'];

function setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  if (value !== undefined && value !== null && value !== '') cur[parts[parts.length - 1]] = value;
}

export type FieldMapping = Record<string, string>;

/**
 * Build mapped rows from CSV data using the given field mapping.
 * Returns array of { rowNumber, data } for the commit API.
 */
export function buildMappedRows(
  data: any[],
  mapping: FieldMapping,
  defaultSource: string,
): Array<{ rowNumber: string; data: Record<string, any> }> {
  const leadFieldToCols: Record<string, string[]> = {};
  Object.entries(mapping).forEach(([csvCol, leadField]) => {
    if (!leadField) return;
    if (!leadFieldToCols[leadField]) leadFieldToCols[leadField] = [];
    leadFieldToCols[leadField].push(csvCol);
  });

  return data.map((row: any, index: number) => {
    const mappedData: Record<string, any> = {};

    const getFirstNonEmpty = (cols: string[]): string => {
      for (const c of cols) {
        const v = row[c];
        if (v != null && String(v).trim() !== '') return String(v).trim();
      }
      return '';
    };

    const getCombined = (cols: string[]): string => {
      return cols
        .map((c) => (row[c] != null && String(row[c]).trim() !== '' ? String(row[c]).trim() : ''))
        .filter(Boolean)
        .join('\n');
    };

    Object.entries(leadFieldToCols).forEach(([leadField, cols]) => {
      if (leadField === 'firstName+lastName') {
        const raw = getFirstNonEmpty(cols);
        const parts = raw.split(/\s+/).filter(Boolean);
        mappedData.firstName = parts[0] ?? '';
        mappedData.lastName = parts.slice(1).join(' ') ?? '';
        return;
      }
      if (leadField === 'notes') {
        const combined = getCombined(cols);
        if (combined) mappedData.notes = (mappedData.notes ? mappedData.notes + '\n' : '') + combined;
        return;
      }
      if (leadField === 'customFields.links') {
        if (!mappedData.customFields) mappedData.customFields = {};
        if (!mappedData.customFields.links) mappedData.customFields.links = {};
        cols.forEach((c) => {
          const v = row[c];
          if (v != null && String(v).trim() !== '') mappedData.customFields.links[c] = String(v).trim();
        });
        return;
      }
      if (leadField === 'phone') {
        mappedData.phone = getFirstNonEmpty(cols);
        return;
      }
      const value = getFirstNonEmpty(cols);
      if (!value && leadField !== 'status') return;

      if (leadField === 'status') {
        const statusVal = value.toUpperCase().replace(/\s+/g, '_');
        if (LEAD_STATUS_VALUES.includes(statusVal)) {
          mappedData.status = statusVal;
        } else {
          mappedData.status = 'NEW';
          setNested(mappedData, 'customFields.legacyStatus', value);
        }
        return;
      }
      if (leadField.includes('.')) {
        setNested(mappedData, leadField, value);
        return;
      }
      if (leadField === 'tags') {
        mappedData[leadField] = value.split(',').map((t: string) => t.trim()).filter(Boolean);
      } else if (leadField === 'score' || leadField === 'estimatedValue') {
        mappedData[leadField] = parseFloat(value) || 0;
      } else {
        mappedData[leadField] = value;
      }
    });

    if (!mappedData.source) mappedData.source = defaultSource;
    if (!mappedData.status) mappedData.status = 'NEW';
    if (mappedData.priority === undefined) mappedData.priority = 'medium';
    if (mappedData.phone === undefined) mappedData.phone = '';

    return {
      rowNumber: String(index + 2),
      data: mappedData,
    };
  });
}

/**
 * Apply a preset to CSV headers. Returns mapping from CSV column name to lead field path.
 */
export function applyPresetMapping(headers: string[], presetId: string): FieldMapping {
  const presetMap =
    presetId === 'pdr-deals'
      ? PRESET_PDR_DEALS_CSV
      : presetId === 'turnkey-pdr-deals'
        ? PRESET_TURNKEY_PDR_DEALS_CSV
        : null;
  if (!presetMap) return {};
  const mapping: FieldMapping = {};
  headers.forEach((h) => {
    const key = h.trim();
    if (presetMap[key] !== undefined) mapping[key] = presetMap[key];
  });
  return mapping;
}

/**
 * Detect preset from CSV headers (e.g. pdr_deals columns).
 */
export function detectPresetFromHeaders(headers: string[]): 'pdr-deals' | 'turnkey-pdr-deals' | '' {
  const keys = new Set(headers.map((h) => h.trim()));
  const pdrKeys = Object.keys(PRESET_PDR_DEALS_CSV);
  const turnkeyKeys = Object.keys(PRESET_TURNKEY_PDR_DEALS_CSV);
  const pdrMatch = pdrKeys.filter((k) => keys.has(k)).length;
  const turnkeyMatch = turnkeyKeys.filter((k) => keys.has(k)).length;
  if (pdrMatch >= 5) return 'pdr-deals';
  if (turnkeyMatch >= 5) return 'turnkey-pdr-deals';
  return '';
}

/**
 * Read file as text with given encoding.
 */
export function readFileWithEncoding(
  file: File,
  encoding: 'utf-8' | 'iso-8859-1',
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (encoding === 'utf-8') {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(reader.error || new Error('File read failed'));
      reader.readAsText(file, 'UTF-8');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const decoder = new TextDecoder('iso-8859-1');
        resolve(decoder.decode(buf));
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Decode failed'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsArrayBuffer(file);
  });
}
