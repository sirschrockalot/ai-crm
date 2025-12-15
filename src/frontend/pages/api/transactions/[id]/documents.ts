import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import * as fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const TRANSACTIONS_SERVICE_API_URL = process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL || 'http://localhost:3003/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const API_URL = `${TRANSACTIONS_SERVICE_API_URL}/transactions/${id}/documents`;

  try {
    if (req.method === 'POST') {
      // Parse the incoming form data
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
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

      // Create FormData to forward to transactions service
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: uploadedFile.originalFilename || 'file',
        contentType: uploadedFile.mimetype || 'application/octet-stream',
      });

      // Forward to transactions service
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
          ...formData.getHeaders(),
        },
        body: formData as any,
      });

      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(`API route /api/transactions/${id}/documents error:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

