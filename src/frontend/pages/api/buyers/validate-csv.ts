import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import * as fs from 'fs';
import * as csv from 'csv-parser';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface PDRBuyerCSV {
  buyerid?: string;
  csvid?: string;
  status?: string;
  bname?: string;
  bstreet?: string;
  bcity?: string;
  bstate?: string;
  bzip?: string;
  bssn?: string;
  bphone1?: string;
  bphone2?: string;
  bemail?: string;
  bpaypalemail?: string;
  downershiptype?: string;
  notes?: string;
  phone_key?: string;
  btype?: string;
  btag1?: string;
  btag2?: string;
  btag3?: string;
  lsource?: string;
  datecr?: string;
  bnotes?: string;
  useridcr?: string;
  audited?: string;
  buyer_street?: string;
  buyer_city?: string;
  buyer_zip?: string;
  buyer_state?: string;
  bneighborhood?: string;
  investment_goals?: string;
  property_notes?: string;
  bcounties?: string;
  archived?: string;
  offer_accepted?: string;
  terminated_reason?: string;
  terminated_user?: string;
  terminated_date?: string;
  sent_comm?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalRows: number;
  preview: PDRBuyerCSV[];
}

function validateBuyerData(csvData: PDRBuyerCSV, rowNumber: number): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!csvData.bemail || !csvData.bemail.includes('@')) {
    errors.push(`Row ${rowNumber}: Valid email is required`);
  }

  if (!csvData.bname) {
    errors.push(`Row ${rowNumber}: Buyer name is required`);
  }

  if (!csvData.bphone1 && !csvData.bphone2) {
    errors.push(`Row ${rowNumber}: At least one phone number is required`);
  }

  // Warning validations
  if (!csvData.bstreet && !csvData.buyer_street) {
    warnings.push(`Row ${rowNumber}: No address provided`);
  }

  if (!csvData.bcity && !csvData.buyer_city) {
    warnings.push(`Row ${rowNumber}: No city provided`);
  }

  if (!csvData.bstate && !csvData.buyer_state) {
    warnings.push(`Row ${rowNumber}: No state provided`);
  }

  if (!csvData.bzip && !csvData.buyer_zip) {
    warnings.push(`Row ${rowNumber}: No zip code provided`);
  }

  // Email format validation
  if (csvData.bemail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(csvData.bemail)) {
    warnings.push(`Row ${rowNumber}: Email format may be invalid`);
  }

  // Phone format validation
  const phone = csvData.bphone1 || csvData.bphone2;
  if (phone && phone.replace(/\D/g, '').length < 10) {
    warnings.push(`Row ${rowNumber}: Phone number may be incomplete`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file || !Array.isArray(file) || file.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = file[0];
    const filePath = uploadedFile.filepath;
    const fileExtension = uploadedFile.originalFilename?.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'csv') {
      return res.status(400).json({ error: 'Only CSV files are supported for validation' });
    }

    // Parse CSV file
    const csvData: PDRBuyerCSV[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    if (csvData.length === 0) {
      return res.status(400).json({ error: 'No data found in CSV file' });
    }

    // Validate each row
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let validRows = 0;

    for (let i = 0; i < csvData.length; i++) {
      const csvRow = csvData[i];
      const rowNumber = i + 2; // +2 because CSV has header and arrays are 0-indexed

      const validation = validateBuyerData(csvRow, rowNumber);
      
      if (validation.isValid) {
        validRows++;
      }
      
      allErrors.push(...validation.errors);
      allWarnings.push(...validation.warnings);
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.warn('Failed to clean up uploaded file:', error);
    }

    // Create preview (first 5 rows)
    const preview = csvData.slice(0, 5);

    const result: ValidationResult = {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      totalRows: csvData.length,
      preview,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error validating CSV:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
