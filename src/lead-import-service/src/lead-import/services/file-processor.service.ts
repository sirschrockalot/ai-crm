import { Injectable, BadRequestException } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { ImportOptionsDto, FieldMappingDto } from '../dto/import-leads.dto';

export interface ParsedRow {
  [key: string]: string | number | null;
  rowNumber: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
}

@Injectable()
export class FileProcessorService {
  private readonly requiredFields = ['name', 'phone'];
  private readonly optionalFields = [
    'email', 'address', 'property_details', 'estimated_value', 
    'asking_price', 'source', 'status', 'priority', 'tags', 'notes'
  ];

  /**
   * Process uploaded file and return parsed data
   */
  async processFile(
    file: Express.Multer.File,
    options: ImportOptionsDto
  ): Promise<{ rows: ParsedRow[]; headers: string[] }> {
    const fileExtension = this.getFileExtension(file.originalname);
    
    switch (fileExtension) {
      case 'csv':
        return this.processCSV(file.buffer, options);
      case 'xlsx':
      case 'xls':
        return this.processExcel(file.buffer, options);
      default:
        throw new BadRequestException(`Unsupported file format: ${fileExtension}`);
    }
  }

  /**
   * Process CSV file
   */
  private async processCSV(
    buffer: Buffer,
    options: ImportOptionsDto
  ): Promise<{ rows: ParsedRow[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const rows: ParsedRow[] = [];
      const headers: string[] = [];
      let isFirstRow = true;

      const stream = Readable.from(buffer);
      
      stream
        .pipe(csv())
        .on('headers', (headerList: string[]) => {
          headers.push(...headerList);
        })
        .on('data', (data: any) => {
          if (isFirstRow) {
            isFirstRow = false;
            return; // Skip header row
          }

          const row: ParsedRow = { rowNumber: rows.length + 2 }; // +2 because we skip header and start from 1
          
          // Map CSV columns to database fields
          headers.forEach((header, index) => {
            const dbField = this.mapColumnToField(header, options.fieldMapping);
            if (dbField && data[header] !== undefined) {
              row[dbField] = this.cleanValue(data[header]);
            }
          });

          rows.push(row);
        })
        .on('end', () => {
          resolve({ rows, headers });
        })
        .on('error', (error) => {
          reject(new BadRequestException(`Failed to parse CSV file: ${error.message}`));
        });
    });
  }

  /**
   * Process Excel file
   */
  private async processExcel(
    buffer: Buffer,
    options: ImportOptionsDto
  ): Promise<{ rows: ParsedRow[]; headers: string[] }> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new BadRequestException('Excel file must contain at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const rows: ParsedRow[] = [];

      // Process data rows (skip header row)
      for (let i = 1; i < jsonData.length; i++) {
        const rowData = jsonData[i] as any[];
        const row: ParsedRow = { rowNumber: i + 1 };

        headers.forEach((header, index) => {
          if (header && rowData[index] !== undefined) {
            const dbField = this.mapColumnToField(header, options.fieldMapping);
            if (dbField) {
              row[dbField] = this.cleanValue(rowData[index]);
            }
          }
        });

        rows.push(row);
      }

      return { rows, headers };
    } catch (error) {
      throw new BadRequestException(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Validate parsed data
   */
  validateData(rows: ParsedRow[]): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    rows.forEach((row) => {
      // Check required fields
      this.requiredFields.forEach(field => {
        if (!row[field] || String(row[field]).trim() === '') {
          errors.push({
            row: row.rowNumber,
            field,
            value: String(row[field] || ''),
            message: `Required field '${field}' is missing or empty`
          });
        }
      });

      // Validate phone format
      if (row.phone && !this.isValidPhone(String(row.phone))) {
        errors.push({
          row: row.rowNumber,
          field: 'phone',
          value: String(row.phone),
          message: 'Invalid phone number format'
        });
      }

      // Validate email format
      if (row.email && !this.isValidEmail(String(row.email))) {
        errors.push({
          row: row.rowNumber,
          field: 'email',
          value: String(row.email),
          message: 'Invalid email format'
        });
      }

      // Validate numeric fields
      if (row.estimated_value && isNaN(Number(row.estimated_value))) {
        errors.push({
          row: row.rowNumber,
          field: 'estimated_value',
          value: String(row.estimated_value),
          message: 'Estimated value must be a valid number'
        });
      }

      if (row.asking_price && isNaN(Number(row.asking_price))) {
        errors.push({
          row: row.rowNumber,
          field: 'asking_price',
          value: String(row.asking_price),
          message: 'Asking price must be a valid number'
        });
      }

      // Validate status values
      if (row.status && !['new', 'contacted', 'under_contract', 'closed', 'lost'].includes(String(row.status))) {
        warnings.push({
          row: row.rowNumber,
          field: 'status',
          value: String(row.status),
          message: `Status '${row.status}' is not a standard value. Using 'new' instead.`
        });
      }

      // Validate priority values
      if (row.priority && !['low', 'medium', 'high', 'urgent'].includes(String(row.priority))) {
        warnings.push({
          row: row.rowNumber,
          field: 'priority',
          value: String(row.priority),
          message: `Priority '${row.priority}' is not a standard value. Using 'medium' instead.`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Map CSV column headers to database fields
   */
  private mapColumnToField(columnHeader: string, fieldMapping?: FieldMappingDto[]): string | null {
    if (!fieldMapping) {
      // Default mapping based on common column names
      const defaultMapping: Record<string, string> = {
        'name': 'name',
        'full_name': 'name',
        'first_name': 'name',
        'last_name': 'name',
        'phone': 'phone',
        'phone_number': 'phone',
        'mobile': 'phone',
        'email': 'email',
        'email_address': 'email',
        'address': 'address.full_address',
        'street': 'address.street',
        'city': 'address.city',
        'state': 'address.state',
        'zip': 'address.zip_code',
        'zip_code': 'address.zip_code',
        'county': 'address.county',
        'property_type': 'property_details.type',
        'bedrooms': 'property_details.bedrooms',
        'bathrooms': 'property_details.bathrooms',
        'square_feet': 'property_details.square_feet',
        'lot_size': 'property_details.lot_size',
        'year_built': 'property_details.year_built',
        'estimated_value': 'estimated_value',
        'value': 'estimated_value',
        'asking_price': 'asking_price',
        'price': 'asking_price',
        'source': 'source',
        'lead_source': 'source',
        'status': 'status',
        'priority': 'priority',
        'tags': 'tags',
        'notes': 'notes',
        'description': 'notes'
      };

      return defaultMapping[columnHeader.toLowerCase()] || null;
    }

    // Use custom field mapping
    const mapping = fieldMapping.find(m => 
      m.csvColumn.toLowerCase() === columnHeader.toLowerCase()
    );
    
    return mapping ? mapping.dbField : null;
  }

  /**
   * Clean and normalize field values
   */
  private cleanValue(value: any): string | number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const stringValue = String(value).trim();
    
    if (stringValue === '') {
      return null;
    }

    // Try to convert to number if it looks like a number
    if (!isNaN(Number(stringValue)) && stringValue !== '') {
      return Number(stringValue);
    }

    return stringValue;
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanedPhone);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}
