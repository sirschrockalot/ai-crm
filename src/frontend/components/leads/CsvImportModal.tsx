import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  Checkbox,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { FiUpload, FiFile } from 'react-icons/fi';
import type { ParseResult } from 'papaparse';
import { parseCsvLenient } from '../../utils/csvLeadImport';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FieldMapping {
  [csvColumn: string]: string;
}

const LEAD_FIELDS = [
  { value: '', label: 'Skip Column' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'firstName+lastName', label: 'First + Last Name (split)' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Source' },
  { value: 'priority', label: 'Priority' },
  { value: 'notes', label: 'Notes' },
  { value: 'address.street', label: 'Address - Street' },
  { value: 'address.city', label: 'Address - City' },
  { value: 'address.state', label: 'Address - State' },
  { value: 'address.zipCode', label: 'Address - Zip Code' },
  { value: 'address.country', label: 'Address - Country' },
  { value: 'tags', label: 'Tags (comma-separated)' },
  { value: 'score', label: 'Score' },
  { value: 'estimatedValue', label: 'Estimated Value' },
  { value: 'customFields.dealId', label: 'Deal ID (customFields.dealId)' },
  { value: 'customFields.external.dealid', label: 'External Deal ID (customFields.external.dealid)' },
  { value: 'customFields.subSource', label: 'Sub Source (customFields.subSource)' },
  { value: 'customFields.legacyStatus', label: 'Legacy Status (customFields.legacyStatus)' },
  { value: 'customFields.links', label: 'Links (customFields.links)' },
];

const PRESET_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'turnkey-pdr-deals', label: 'Turnkey/PDR Deals CSV' },
  { value: 'pdr-deals', label: 'PDR Deals' },
];

/** Built-in preset: Turnkey/PDR Deals CSV header -> lead field */
const PRESET_TURNKEY_PDR_DEALS_CSV: Record<string, string> = {
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

/** Built-in preset: PDR Deals (pdr_deals.csv) - matches docs/imports/pdr_deals.csv; latin1 encoding */
const PRESET_PDR_DEALS_CSV: Record<string, string> = {
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

const LEAD_STATUS_VALUES = ['NEW', 'CONTACTED', 'APPT_SET', 'OFFER_SENT', 'UNDER_CONTRACT', 'DEAD', 'NURTURE', 'FOLLOW_UP', 'QUALIFIED', 'CONVERTED', 'LOST'];

/** Chunk size for batched commit to avoid body size / timeouts (70k+ rows). */
const COMMIT_BATCH_SIZE = 5000;

/** Max errors to keep in aggregated result so UI stays responsive. */
const MAX_AGGREGATED_ERRORS = 500;

function setNested(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {};
    cur = cur[key];
  }
  if (value !== undefined && value !== null && value !== '') cur[parts[parts.length - 1]] = value;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [preset, setPreset] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [defaultSource, setDefaultSource] = useState<string>('other');
  const [createNoteEvents, setCreateNoteEvents] = useState<boolean>(false);
  /** When set, we're committing in batches; { current, total }. */
  const [importBatchProgress, setImportBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const applyPresetMapping = (headers: string[], presetId: string): FieldMapping => {
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
  };

  const readFileWithEncoding = (
    file: File,
    encoding: 'utf-8' | 'iso-8859-1',
    onComplete: (csvString: string) => void,
    onError: (err: Error) => void,
  ) => {
    if (encoding === 'utf-8') {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || '';
        onComplete(text);
      };
      reader.onerror = () => onError(reader.error || new Error('File read failed'));
      reader.readAsText(file, 'UTF-8');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const decoder = new TextDecoder('iso-8859-1');
        const csvString = decoder.decode(buf);
        onComplete(csvString);
      } catch (e) {
        onError(e instanceof Error ? e : new Error('Decode failed'));
      }
    };
    reader.onerror = () => onError(reader.error || new Error('File read failed'));
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file',
        description: 'Please select a CSV file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const encoding = preset === 'pdr-deals' ? 'iso-8859-1' : 'utf-8';
    readFileWithEncoding(
      file,
      encoding,
      (csvString) => {
        const results = parseCsvLenient(csvString);
        if (results.errors?.length > 0) {
          toast({
            title: 'CSV Parse Error',
            description: results.errors[0].message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        const headers = Object.keys(results.data[0] || {});
        const rows = results.data.slice(0, 10); // Show first 10 rows as preview

        setCsvHeaders(headers);
        setCsvRows(rows as any[]);
        setImportResult(null);
        setDryRunResult(null);

        const presetMapping = applyPresetMapping(headers, preset);
        if (Object.keys(presetMapping).length > 0) {
          setFieldMapping(presetMapping);
        } else {
          const autoMapping: FieldMapping = {};
          headers.forEach((header) => {
            const lowerHeader = header.toLowerCase().trim();
            const field = LEAD_FIELDS.find((f) => {
              if (!f.value) return false;
              const fieldName = f.label.toLowerCase();
              return lowerHeader.includes(fieldName.split(' ')[0]) || 
                     fieldName.includes(lowerHeader.split(' ')[0]);
            });
            if (field && field.value) {
              autoMapping[header] = field.value;
            }
          });
          setFieldMapping(autoMapping);
        }
      },
      (error) => {
        toast({
          title: 'File Read Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    );
  };

  const handleImport = () => {
    if (csvHeaders.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'File not found', description: 'Please select a file again.', status: 'error', duration: 5000, isClosable: true });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    const encoding = preset === 'pdr-deals' ? 'iso-8859-1' : 'utf-8';
    readFileWithEncoding(
      file,
      encoding,
      (csvString) => {
        const results = parseCsvLenient(csvString);
        (async () => {
            try {
              if (results.errors?.length) {
                toast({ title: 'CSV Parse Error', description: results.errors[0].message, status: 'error', duration: 5000, isClosable: true });
                setIsImporting(false);
                return;
              }
              const mappedRows = buildMappedRows(results.data, fieldMapping, defaultSource || 'other');
              const MAX_IMPORT_ROWS = 100000;
              if (mappedRows.length > MAX_IMPORT_ROWS) {
                toast({ title: 'Row limit', description: `CSV exceeds ${MAX_IMPORT_ROWS.toLocaleString()} rows. Please split your file.`, status: 'error', duration: 5000, isClosable: true });
                setIsImporting(false);
                return;
              }

              const token = localStorage.getItem('auth_token');
              const chunks: typeof mappedRows[] = [];
              for (let i = 0; i < mappedRows.length; i += COMMIT_BATCH_SIZE) {
                chunks.push(mappedRows.slice(i, i + COMMIT_BATCH_SIZE));
              }

              let result: {
                importId?: string;
                createdCount: number;
                duplicateCount: number;
                errors: Array<{ rowNumber: string; message: string }>;
                duplicates?: Array<{ rowNumber: string; duplicateOf: string }>;
              } = {
                createdCount: 0,
                duplicateCount: 0,
                errors: [],
              };

              for (let b = 0; b < chunks.length; b++) {
                setImportBatchProgress({ current: b + 1, total: chunks.length });
                const response = await fetch('/api/imports/leads/commit', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    rows: chunks[b],
                    defaultSource: defaultSource || 'other',
                    createNoteEvents: createNoteEvents,
                    preset: preset ? (PRESET_OPTIONS.find((o) => o.value === preset)?.label ?? preset) : undefined,
                  }),
                });

                if (!response.ok) {
                  const errBody = await response.json();
                  throw new Error(errBody.message || errBody.error || 'Commit failed');
                }

                const batchResult = await response.json();
                result.createdCount += batchResult.createdCount ?? 0;
                result.duplicateCount += batchResult.duplicateCount ?? 0;
                if (batchResult.errors?.length) {
                  result.errors.push(...batchResult.errors);
                }
                if (batchResult.duplicates?.length && !result.duplicates) result.duplicates = [];
                if (batchResult.duplicates?.length) result.duplicates!.push(...batchResult.duplicates);
                if (batchResult.importId && !result.importId) result.importId = batchResult.importId;
              }

              setImportBatchProgress(null);
              const totalErrorCount = result.errors.length;
              if (result.errors.length > MAX_AGGREGATED_ERRORS) {
                result.errors = result.errors.slice(0, MAX_AGGREGATED_ERRORS);
                result.errors.push({ rowNumber: '—', message: `… and ${totalErrorCount - MAX_AGGREGATED_ERRORS} more errors (${totalErrorCount} total).` } as any);
              }
              (result as any).totalErrorCount = totalErrorCount;
              const totalErrors = totalErrorCount;
              setImportResult(result);
              setDryRunResult(null);

              const totalProcessed = result.createdCount + result.duplicateCount + totalErrors;
              toast({
                title: 'Import completed',
                description: result.importId
                  ? `Processed ${totalProcessed} rows → Created: ${result.createdCount}, Duplicates: ${result.duplicateCount}, Errors: ${totalErrors} (importId: ${result.importId})`
                  : `Processed ${totalProcessed} rows → Created: ${result.createdCount}, Duplicates: ${result.duplicateCount}, Errors: ${totalErrors}`,
                status: 'success',
                duration: 7000,
                isClosable: true,
              });

              if (onSuccess) onSuccess();
            } catch (error: any) {
              setImportBatchProgress(null);
              toast({
                title: 'Import failed',
                description: error.message || 'Failed to import leads',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            } finally {
              setIsImporting(false);
              setImportBatchProgress(null);
            }
        })();
      },
      (err) => {
        toast({ title: 'File read failed', description: err.message, status: 'error', duration: 5000, isClosable: true });
        setIsImporting(false);
      },
    );
  };

  const handlePreview = () => {
    if (csvHeaders.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'File not found', status: 'error', duration: 5000, isClosable: true });
      return;
    }

    setIsImporting(true);
    setDryRunResult(null);

    const encoding = preset === 'pdr-deals' ? 'iso-8859-1' : 'utf-8';
    readFileWithEncoding(
      file,
      encoding,
      (csvString) => {
        const results = parseCsvLenient(csvString);
        (async () => {
            try {
              if (results.errors?.length) {
                toast({ title: 'CSV Parse Error', description: results.errors[0].message, status: 'error', duration: 5000, isClosable: true });
                setIsImporting(false);
                return;
              }
              const mappedRows = buildMappedRows(results.data, fieldMapping, defaultSource || 'other');
              const MAX_IMPORT_ROWS = 100000;
              if (mappedRows.length > MAX_IMPORT_ROWS) {
                toast({ title: 'Row limit', description: `CSV exceeds ${MAX_IMPORT_ROWS.toLocaleString()} rows. Please split your file.`, status: 'error', duration: 5000, isClosable: true });
                setIsImporting(false);
                return;
              }

              const token = localStorage.getItem('auth_token');
              const response = await fetch('/api/imports/leads/dry-run', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  rows: mappedRows,
                  defaultSource: defaultSource || 'other',
                  preset: preset ? (PRESET_OPTIONS.find((o) => o.value === preset)?.label ?? preset) : undefined,
                }),
              });

              if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || err.error || 'Dry-run failed');
              }

              const result = await response.json();
              setDryRunResult(result);
              toast({
                title: 'Preview ready',
                description: `Would create: ${result.createdCount}, Duplicates: ${result.duplicateCount}, Errors: ${result.errors?.length ?? 0}`,
                status: 'info',
                duration: 5000,
                isClosable: true,
              });
            } catch (error: any) {
              toast({
                title: 'Preview failed',
                description: error.message || 'Dry-run failed',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            } finally {
              setIsImporting(false);
            }
        })();
      },
      (err) => {
        toast({ title: 'File read failed', description: err.message, status: 'error', duration: 5000, isClosable: true });
        setIsImporting(false);
      },
    );
  };

  function buildMappedRows(
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
        // Always set phone from first non-empty of HomePhone | SecondaryPhone (PDR has at least one)
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

  const handleReset = () => {
    setCsvHeaders([]);
    setCsvRows([]);
    setFieldMapping({});
    setPreset('');
    setCreateNoteEvents(false);
    setDryRunResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import Leads from CSV</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {importBatchProgress && (
              <>
                <Text fontSize="sm" color="gray.600">
                  Importing batch {importBatchProgress.current} of {importBatchProgress.total}…
                </Text>
                <Progress
                  size="sm"
                  value={importBatchProgress.total ? (importBatchProgress.current / importBatchProgress.total) * 100 : 0}
                  colorScheme="blue"
                  borderRadius="md"
                />
              </>
            )}
            {!importResult && (
              <>
                <FormControl>
                  <FormLabel>Select CSV File</FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    leftIcon={<FiUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    w="full"
                  >
                    Choose CSV File
                  </Button>
                </FormControl>

                {csvHeaders.length > 0 && (
                  <>
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        Found {csvHeaders.length} columns. Map each CSV column to a Lead field below.
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>Preset</FormLabel>
                      <Select
                        value={preset}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPreset(v);
                          const next = applyPresetMapping(csvHeaders, v);
                          if (Object.keys(next).length > 0) setFieldMapping((prev) => ({ ...prev, ...next }));
                        }}
                      >
                        {PRESET_OPTIONS.map((o) => (
                          <option key={o.value || 'none'} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Default Source (if not in CSV)</FormLabel>
                      <Select
                        value={defaultSource}
                        onChange={(e) => setDefaultSource(e.target.value)}
                      >
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="social_media">Social Media</option>
                        <option value="advertising">Advertising</option>
                        <option value="cold_call">Cold Call</option>
                        <option value="email_campaign">Email Campaign</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <Checkbox
                        isChecked={createNoteEvents}
                        onChange={(e) => setCreateNoteEvents(e.target.checked)}
                      >
                        Create timeline note for imported notes
                      </Checkbox>
                    </FormControl>

                    <Box overflowX="auto">
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>CSV Column</Th>
                            <Th>Map to Lead Field</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {csvHeaders.map((header) => (
                            <Tr key={header}>
                              <Td>
                                <Text fontSize="sm" fontWeight="medium">
                                  {header}
                                </Text>
                                {csvRows[0] && (
                                  <Text fontSize="xs" color="gray.500">
                                    Sample: {String(csvRows[0][header] || '').substring(0, 30)}
                                  </Text>
                                )}
                              </Td>
                              <Td>
                                <Select
                                  value={fieldMapping[header] || ''}
                                  onChange={(e) =>
                                    setFieldMapping({
                                      ...fieldMapping,
                                      [header]: e.target.value,
                                    })
                                  }
                                  size="sm"
                                >
                                  {LEAD_FIELDS.map((field) => (
                                    <option key={field.value} value={field.value}>
                                      {field.label}
                                    </option>
                                  ))}
                                </Select>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                )}
              </>
            )}

            {dryRunResult && !importResult && (
              <>
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>Preview: no data written. Review below and click Commit to import.</AlertDescription>
                </Alert>
                <SimpleGrid columns={3} spacing={4}>
                  <Stat>
                    <StatLabel>Would create</StatLabel>
                    <StatNumber>{dryRunResult.createdCount}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Duplicates (skipped)</StatLabel>
                    <StatNumber>{dryRunResult.duplicateCount}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Errors</StatLabel>
                    <StatNumber>{dryRunResult.errors?.length ?? 0}</StatNumber>
                  </Stat>
                </SimpleGrid>
                {dryRunResult.errors?.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Errors:</Text>
                    <VStack align="stretch" spacing={1} maxH="120px" overflowY="auto">
                      {dryRunResult.errors.map((err: any, idx: number) => (
                        <Text key={idx} fontSize="sm" color="red.500">
                          Row {err.rowNumber}: {err.message}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
                {dryRunResult.duplicates?.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Duplicates:</Text>
                    <VStack align="stretch" spacing={1} maxH="100px" overflowY="auto">
                      {dryRunResult.duplicates.slice(0, 10).map((d: any, idx: number) => (
                        <HStack key={idx} justify="space-between">
                          <Text fontSize="sm">Row {d.rowNumber}</Text>
                          <Badge size="sm" colorScheme="orange">duplicate of {d.duplicateOf}</Badge>
                        </HStack>
                      ))}
                      {dryRunResult.duplicates.length > 10 && (
                        <Text fontSize="xs" color="gray.500">+{dryRunResult.duplicates.length - 10} more</Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </>
            )}

            {importResult && (
              <>
                <Alert status="success">
                  <AlertIcon />
                  <AlertDescription>Import completed successfully!</AlertDescription>
                </Alert>

                <SimpleGrid columns={3} spacing={4}>
                  <Stat>
                    <StatLabel>Created</StatLabel>
                    <StatNumber>{importResult.createdCount}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Duplicates</StatLabel>
                    <StatNumber>{importResult.duplicateCount}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Errors</StatLabel>
                    <StatNumber>{importResult.totalErrorCount ?? importResult.errors?.length ?? 0}</StatNumber>
                  </Stat>
                </SimpleGrid>

                {importResult.importId && (
                  <Text fontSize="sm" color="gray.600">Import ID: {importResult.importId}</Text>
                )}
                {importResult.errors?.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Errors:</Text>
                    <VStack align="stretch" spacing={1} maxH="200px" overflowY="auto">
                      {importResult.errors.map((error: any, idx: number) => (
                        <Text key={idx} fontSize="sm" color="red.500">
                          Row {error.rowNumber}: {error.message}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {importResult.duplicates?.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Duplicates Found:</Text>
                    <VStack align="stretch" spacing={1} maxH="200px" overflowY="auto">
                      {importResult.duplicates.map((dup: any, idx: number) => (
                        <HStack key={idx} justify="space-between">
                          <Text fontSize="sm">Row {dup.rowNumber}</Text>
                          <Badge colorScheme="orange">Duplicate of {dup.duplicateOf}</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            {importResult ? (
              <>
                <Button onClick={handleReset} variant="outline">
                  Import Another
                </Button>
                <Button onClick={onClose} colorScheme="blue">
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose} variant="ghost">
                  Cancel
                </Button>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  isLoading={isImporting}
                  isDisabled={csvHeaders.length === 0}
                >
                  Preview (dry-run)
                </Button>
                <Button
                  onClick={handleImport}
                  colorScheme="blue"
                  isLoading={isImporting}
                  isDisabled={csvHeaders.length === 0}
                >
                  Commit import
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
