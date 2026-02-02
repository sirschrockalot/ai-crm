#!/usr/bin/env node
/**
 * Run PDR Deals CSV import (first 2000 rows) against Leads Service.
 * Usage:
 *   LEADS_SERVICE_URL=http://localhost:3008 AUTH_TOKEN=<jwt> node scripts/run-pdr-import.js
 *   Or via frontend proxy: API_BASE=http://localhost:3000 AUTH_TOKEN=<jwt> node scripts/run-pdr-import.js
 * CSV: docs/imports/pdr_deals.csv (latin1), preset: PDR Deals.
 */

const fs = require('fs');
const path = require('path');

const MAX_ROWS = 2000;
const CSV_PATH = path.join(__dirname, '../docs/imports/pdr_deals.csv');

// PDR Deals preset: CSV column -> lead field
const PRESET_PDR_DEALS = {
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
  dealid: 'customFields.external.dealid',
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

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
      out.push(cur.trim());
      cur = '';
      if (c === '\r') break;
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function setNested(obj, pathStr, value) {
  if (value === undefined || value === null || value === '') return;
  const parts = pathStr.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {};
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

function buildMappedRows(rows, headers) {
  const headerIndex = {};
  headers.forEach((h, i) => { headerIndex[h] = i; });

  return rows.map((values, index) => {
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] != null ? String(values[i]).trim() : ''; });

    const mappedData = {};
    const get = (col) => {
      const v = row[col];
      return v != null && v !== '' ? v : '';
    };
    const getFirst = (cols) => {
      for (const c of cols) { const v = get(c); if (v) return v; }
      return '';
    };
    const getCombined = (cols) => cols.map(c => get(c)).filter(Boolean).join('\n');

    for (const [csvCol, leadField] of Object.entries(PRESET_PDR_DEALS)) {
      if (!row.hasOwnProperty(csvCol)) continue;
      if (leadField === 'firstName+lastName') {
        const raw = get(csvCol);
        const parts = raw.split(/\s+/).filter(Boolean);
        mappedData.firstName = parts[0] ?? '';
        mappedData.lastName = parts.slice(1).join(' ') ?? '';
      } else if (leadField === 'notes') {
        const v = get(csvCol);
        if (v) mappedData.notes = (mappedData.notes ? mappedData.notes + '\n' : '') + v;
      } else if (leadField === 'customFields.links') {
        if (!mappedData.customFields) mappedData.customFields = {};
        if (!mappedData.customFields.links) mappedData.customFields.links = {};
        const v = get(csvCol);
        if (v) mappedData.customFields.links[csvCol] = v;
      } else if (leadField === 'status') {
        const value = get(csvCol);
        const statusVal = value.toUpperCase().replace(/\s+/g, '_');
        if (LEAD_STATUS_VALUES.includes(statusVal)) {
          mappedData.status = statusVal;
        } else {
          mappedData.status = 'NEW';
          setNested(mappedData, 'customFields.legacyStatus', value);
        }
      } else if (leadField.includes('.')) {
        setNested(mappedData, leadField, get(csvCol));
      } else if (leadField === 'score') {
        const n = parseFloat(get(csvCol));
        mappedData.score = isNaN(n) ? 0 : n;
      } else {
        const v = get(csvCol);
        if (v) mappedData[leadField] = v;
      }
    }

    if (!mappedData.source) mappedData.source = 'other';
    if (!mappedData.status) mappedData.status = 'NEW';
    if (mappedData.priority === undefined) mappedData.priority = 'medium';

    return { rowNumber: String(index + 2), data: mappedData };
  });
}

function main() {
  const leadsBase = process.env.LEADS_SERVICE_URL || process.env.NEXT_PUBLIC_LEADS_SERVICE_URL || 'http://localhost:3008';
  const apiBase = process.env.API_BASE; // e.g. http://localhost:3000 to hit Next.js proxy
  const token = process.env.AUTH_TOKEN;

  if (!token) {
    console.error('AUTH_TOKEN is required. Log in to the app, copy the JWT from localStorage (auth_token), and run:');
    console.error('  AUTH_TOKEN=<token> LEADS_SERVICE_URL=http://localhost:3008 node scripts/run-pdr-import.js');
    process.exit(1);
  }

  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
  let url;
  if (apiBase) {
    url = `${apiBase.replace(/\/$/, '')}/api/imports/leads/${dryRun ? 'dry-run' : 'commit'}`;
  } else {
    const base = leadsBase.replace(/\/$/, '');
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    url = `${base}/${apiPrefix}/imports/leads/${dryRun ? 'dry-run' : 'commit'}`;
  }

  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH);
    process.exit(1);
  }

  const buf = fs.readFileSync(CSV_PATH);
  const csvString = buf.toString('latin1');
  const lines = csvString.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length < 2) {
    console.error('CSV has no data rows');
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]);
  const dataLines = lines.slice(1, 1 + MAX_ROWS);
  const rows = dataLines.map(l => parseCSVLine(l));
  const mapped = buildMappedRows(rows, headers);

  console.log('CSV path:', CSV_PATH);
  console.log('Total CSV rows:', lines.length - 1);
  console.log('Importing (max):', mapped.length);
  console.log('URL:', url, dryRun ? '(dry-run)' : '(commit)');

  const body = JSON.stringify({
    rows: mapped,
    defaultSource: 'other',
    preset: 'PDR Deals',
    createNoteEvents: false,
  });

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body,
  })
    .then(async (res) => {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Response:', res.status, text.slice(0, 500));
        process.exit(1);
      }
      if (!res.ok) {
        console.error('Import failed:', res.status, data);
        process.exit(1);
      }
      const created = data.createdCount ?? 0;
      const duplicates = data.duplicateCount ?? 0;
      const errors = (data.errors && data.errors.length) ? data.errors.length : 0;
      const successful = created;
      const unsuccessful = duplicates + errors;
      console.log('\n--- Import result ---');
      console.log('Successful (created):', successful);
      console.log('Unsuccessful (duplicates + errors):', unsuccessful);
      console.log('  Duplicates:', duplicates);
      console.log('  Errors:', errors);
      if (data.importId) console.log('Import ID:', data.importId);
      if (dryRun) console.log('\n(Dry-run: no data written. Run without DRY_RUN=1 to commit.)');
    })
    .catch((err) => {
      console.error('Request failed:', err.message);
      process.exit(1);
    });
}

main();
