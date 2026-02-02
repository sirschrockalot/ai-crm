# PDR Deals CSV Import

## File

- **`pdr_deals.csv`** – Production dump from existing CRM. Use for full re-import into the dealCycle (Leads Service) database.

## Before Re-Import: Purge Existing Data

1. Open the CRM → **Leads** page.
2. Use the **Purge** action (e.g. from the leads page menu).
3. Confirm. This deletes all leads and import-run records in the Leads Service DB so the next import is clean.

Alternatively, call the purge API (when signed in):

```bash
curl -X POST http://localhost:3000/api/imports/leads/purge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT"
```

## Import Steps

1. **Leads** → **Import** (or open the CSV import modal).
2. Select **PDR Deals** preset (uses `docs/imports/pdr_deals.csv` column names and Latin1 encoding).
3. Choose `pdr_deals.csv`, then **Preview** (dry-run), then **Commit** to import.

The preset maps:

- **dealid** → `customFields.external.dealid` (required for dedupe)
- **HomePhone**, **SecondaryPhone** → `phone` (first non-empty)
- **ClientName** → first + last name
- **ListPrice** → `estimatedValue`
- **LeadSource** → `source` (stored as-is, e.g. "PPC")
- **status** → mapped to Lead status enum
- **datecr**, **SubSource**, **notes**, **property_notes**, **leadscore**, links, etc. → as in preset

Every row is accepted if it has at least one of: **phone**, **customFields.external.dealid**, or **email**.
