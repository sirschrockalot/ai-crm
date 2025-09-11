import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import * as fs from 'fs';
import csv from 'csv-parser';

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

interface Buyer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  buyerType: 'individual' | 'company' | 'investor';
  investmentRange: '0-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k+';
  preferredPropertyTypes: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  defaultStatus?: boolean;
  fieldMapping?: Record<string, string>;
}

interface ImportResponse {
  success: boolean;
  message: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors?: string[];
}

// Mock buyers data (in a real app, this would come from a database)
const mockBuyers: Buyer[] = [];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function mapCSVToBuyer(csvData: PDRBuyerCSV): Partial<Buyer> {
  // Map PDR CSV fields to Buyer interface
  const buyer: Partial<Buyer> = {
    companyName: csvData.bname || '',
    contactName: csvData.bname || '', // Using bname as contact name if no separate field
    email: csvData.bemail || '',
    phone: csvData.bphone1 || csvData.bphone2 || '',
    address: csvData.bstreet || csvData.buyer_street || '',
    city: csvData.bcity || csvData.buyer_city || '',
    state: csvData.bstate || csvData.buyer_state || '',
    zipCode: csvData.bzip || csvData.buyer_zip || '',
    notes: csvData.notes || csvData.bnotes || csvData.property_notes || '',
  };

  // Map buyer type
  if (csvData.btype) {
    const btype = csvData.btype.toLowerCase();
    if (btype.includes('individual') || btype.includes('person')) {
      buyer.buyerType = 'individual';
    } else if (btype.includes('company') || btype.includes('corp') || btype.includes('llc')) {
      buyer.buyerType = 'company';
    } else if (btype.includes('investor')) {
      buyer.buyerType = 'investor';
    } else {
      buyer.buyerType = 'individual'; // Default
    }
  } else {
    buyer.buyerType = 'individual';
  }

  // Map investment range based on investment_goals or other fields
  if (csvData.investment_goals) {
    const goals = csvData.investment_goals.toLowerCase();
    if (goals.includes('0-50') || goals.includes('50k')) {
      buyer.investmentRange = '0-50k';
    } else if (goals.includes('50-100') || goals.includes('100k')) {
      buyer.investmentRange = '50k-100k';
    } else if (goals.includes('100-250') || goals.includes('250k')) {
      buyer.investmentRange = '100k-250k';
    } else if (goals.includes('250-500') || goals.includes('500k')) {
      buyer.investmentRange = '250k-500k';
    } else if (goals.includes('500+') || goals.includes('500k+')) {
      buyer.investmentRange = '500k+';
    } else {
      buyer.investmentRange = '100k-250k'; // Default
    }
  } else {
    buyer.investmentRange = '100k-250k';
  }

  // Map property types from tags or other fields
  const propertyTypes: string[] = [];
  if (csvData.btag1) propertyTypes.push(csvData.btag1);
  if (csvData.btag2) propertyTypes.push(csvData.btag2);
  if (csvData.btag3) propertyTypes.push(csvData.btag3);
  
  // Map common property type keywords
  const allTags = [csvData.btag1, csvData.btag2, csvData.btag3, csvData.property_notes].join(' ').toLowerCase();
  if (allTags.includes('single') || allTags.includes('family')) {
    propertyTypes.push('single_family');
  }
  if (allTags.includes('multi') || allTags.includes('duplex') || allTags.includes('triplex')) {
    propertyTypes.push('multi_family');
  }
  if (allTags.includes('commercial') || allTags.includes('office') || allTags.includes('retail')) {
    propertyTypes.push('commercial');
  }
  if (allTags.includes('land') || allTags.includes('lot') || allTags.includes('acre')) {
    propertyTypes.push('land');
  }

  buyer.preferredPropertyTypes = propertyTypes.length > 0 ? propertyTypes : ['single_family'];

  // Map status
  const status = csvData.status?.toLowerCase() || '';
  buyer.isActive = !status.includes('inactive') && !status.includes('archived') && status !== '0';

  return buyer;
}

function validateBuyer(buyer: Partial<Buyer>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!buyer.email || !buyer.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!buyer.companyName && !buyer.contactName) {
    errors.push('Company name or contact name is required');
  }

  if (!buyer.phone) {
    errors.push('Phone number is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImportResponse | { error: string }>
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
      return res.status(400).json({ error: 'Only CSV files are supported for buyer import' });
    }

    // Parse options
    const options: ImportOptions = {
      skipDuplicates: fields.skipDuplicates === 'true',
      updateExisting: fields.updateExisting === 'true',
      defaultStatus: fields.defaultStatus !== 'false',
    };

    if (fields.fieldMapping) {
      try {
        options.fieldMapping = JSON.parse(fields.fieldMapping);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid field mapping JSON' });
      }
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

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const csvRow = csvData[i];
      const rowNumber = i + 2; // +2 because CSV has header and arrays are 0-indexed

      try {
        // Map CSV data to buyer format
        const buyerData = mapCSVToBuyer(csvRow);

        // Validate buyer data
        const validation = validateBuyer(buyerData);
        if (!validation.isValid) {
          errors.push(`Row ${rowNumber}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Check for duplicates by email
        const existingBuyerIndex = mockBuyers.findIndex(b => 
          b.email.toLowerCase() === buyerData.email?.toLowerCase()
        );

        if (existingBuyerIndex !== -1) {
          if (options.skipDuplicates) {
            skippedCount++;
            continue;
          }
          
          if (options.updateExisting) {
            // Update existing buyer
            const updatedBuyer: Buyer = {
              ...mockBuyers[existingBuyerIndex],
              ...buyerData,
              id: mockBuyers[existingBuyerIndex].id, // Preserve original ID
              updatedAt: new Date().toISOString(),
            };
            
            mockBuyers[existingBuyerIndex] = updatedBuyer;
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Create new buyer
          const newBuyer: Buyer = {
            id: generateId(),
            companyName: buyerData.companyName!,
            contactName: buyerData.contactName!,
            email: buyerData.email!,
            phone: buyerData.phone || '',
            address: buyerData.address || '',
            city: buyerData.city || '',
            state: buyerData.state || '',
            zipCode: buyerData.zipCode || '',
            buyerType: buyerData.buyerType!,
            investmentRange: buyerData.investmentRange!,
            preferredPropertyTypes: buyerData.preferredPropertyTypes || ['single_family'],
            notes: buyerData.notes || '',
            isActive: buyerData.isActive !== undefined ? buyerData.isActive : options.defaultStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          mockBuyers.push(newBuyer);
          importedCount++;
        }
      } catch (error) {
        errors.push(`Row ${rowNumber}: Failed to process buyer - ${error}`);
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.warn('Failed to clean up uploaded file:', error);
    }

    return res.status(200).json({
      success: importedCount > 0 || updatedCount > 0,
      message: `Import completed: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`,
      importedCount,
      updatedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing buyers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
