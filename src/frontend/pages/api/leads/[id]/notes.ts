import { NextApiRequest, NextApiResponse } from 'next';
import { LeadNote } from '../../../../types';

// In-memory store for notes (in production, this would be a database)
const notesStore: Map<string, LeadNote[]> = new Map();

// Initialize with some mock notes for existing leads
const initializeMockNotes = () => {
  if (notesStore.size === 0) {
    // Mock notes for lead ID '1'
    notesStore.set('1', [
      {
        id: 'note-1-1',
        leadId: '1',
        author: 'Sarah Johnson',
        authorId: 'user-1',
        content: 'Owner is very motivated to sell quickly. Mentioned they\'re relocating for work and need to close by end of January. This could be a great opportunity for a quick flip.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'note-1-2',
        leadId: '1',
        author: 'Mike Rodriguez',
        authorId: 'user-2',
        content: 'Property is in good condition overall. Minor cosmetic updates needed but nothing major. Perfect for our buyer pool.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'note-1-3',
        leadId: '1',
        author: 'Sarah Johnson',
        authorId: 'user-1',
        content: 'Initial contact made via phone. Owner was receptive to our offer and agreed to meet for contract signing.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);
  }
};

initializeMockNotes();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadNote[] | LeadNote | { error: string }>
) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  // Check if authentication bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  
  // Basic authentication check (skip if bypass is enabled)
  if (!bypassAuth) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  switch (req.method) {
    case 'GET':
      // Get all notes for a lead
      const notes = notesStore.get(leadId) || [];
      // Sort by createdAt descending (newest first)
      const sortedNotes = [...notes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return res.status(200).json(sortedNotes);

    case 'POST':
      // Create a new note
      const { content, author, authorId } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Note content is required' });
      }

      if (!author) {
        return res.status(400).json({ error: 'Author is required' });
      }

      const newNote: LeadNote = {
        id: `note-${leadId}-${Date.now()}`,
        leadId,
        author: author || 'Unknown User',
        authorId: authorId || 'unknown',
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingNotes = notesStore.get(leadId) || [];
      existingNotes.push(newNote);
      notesStore.set(leadId, existingNotes);

      return res.status(201).json(newNote);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

