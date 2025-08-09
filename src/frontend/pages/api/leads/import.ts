import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImportResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [, files] = await new Promise<[any, any]>((resolve, reject) => {
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

    if (!fileExtension || !['csv', 'json', 'xlsx'].includes(fileExtension)) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload CSV, JSON, or Excel files.' });
    }

    // Read file content
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Mock import processing
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      if (fileExtension === 'csv') {
        // Mock CSV processing
        const lines = fileContent.split('\n').filter(line => line.trim());
        imported = Math.min(lines.length - 1, 50); // Mock: import up to 50 leads
        failed = Math.max(0, lines.length - 1 - imported);
      } else if (fileExtension === 'json') {
        // Mock JSON processing
        const data = JSON.parse(fileContent);
        const leads = Array.isArray(data) ? data : [data];
        imported = Math.min(leads.length, 50);
        failed = Math.max(0, leads.length - imported);
      } else if (fileExtension === 'xlsx') {
        // Mock Excel processing
        imported = 25; // Mock: import 25 leads
        failed = 5; // Mock: 5 failed
      }

      if (imported === 0) {
        errors.push('No valid leads found in file');
      }

      return res.status(200).json({
        success: true,
        imported,
        failed,
        errors,
      });
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        imported: 0,
        failed: 1,
        errors: ['Failed to parse file content'],
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      imported: 0,
      failed: 1,
      errors: ['File upload failed'],
    });
  }
}
