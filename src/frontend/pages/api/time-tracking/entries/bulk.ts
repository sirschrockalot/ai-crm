import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid entries data' });
    }

    // Mock bulk creation of entries
    const createdEntries = entries.map((entry: any, index: number) => ({
      _id: Date.now().toString() + index,
      ...entry,
      timestamp: new Date().toISOString(),
      status: 'pending',
    }));

    res.status(201).json({
      message: `Successfully created ${createdEntries.length} entries`,
      entries: createdEntries,
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
