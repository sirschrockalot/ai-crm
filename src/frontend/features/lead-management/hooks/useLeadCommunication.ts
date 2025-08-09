import { useState, useCallback } from 'react';
import { CommunicationMessage } from '../types/lead';

export function useLeadCommunication(leadId: string) {
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (type: 'sms' | 'email' | 'call', content: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - in real implementation, this would call the communication service
      const newMessage: CommunicationMessage = {
        id: Date.now().toString(),
        leadId,
        type,
        content,
        timestamp: new Date(),
        status: 'sent',
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - in real implementation, this would fetch from communication service
      const mockMessages: CommunicationMessage[] = [
        {
          id: '1',
          leadId,
          type: 'sms',
          content: 'Hi John, I saw your property listing. Are you still interested in selling?',
          timestamp: new Date(Date.now() - 3600000),
          status: 'delivered',
        },
        {
          id: '2',
          leadId,
          type: 'call',
          content: 'Spoke with John about the property. He is interested in a quick sale.',
          timestamp: new Date(Date.now() - 1800000),
          status: 'sent',
        },
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const markAsRead = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'delivered' } : msg
    ));
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
    markAsRead,
    deleteMessage,
  };
}
