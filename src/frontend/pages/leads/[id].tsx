import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  useToast, 
  Divider, 
  Avatar, 
  Grid, 
  Spinner, 
  Alert, 
  AlertIcon,
  Badge,
  Button,
  SimpleGrid,
  Flex,
  IconButton,
  Textarea,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  InputGroup,
  InputLeftElement,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { 
  FiPhone, 
  FiMessageSquare, 
  FiMail, 
  FiFileText, 
  FiCalendar, 
  FiX,
  FiEdit,
  FiPlus,
  FiUser,
  FiDollarSign,
  FiFile,
  FiMessageCircle,
  FiClock,
  FiUsers,
  FiZap,
  FiSettings,
  FiBookmark,
  FiChevronRight,
  FiMapPin,
  FiHome,
  FiStar,
  FiCheckCircle,
  FiAlertCircle,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import { LeadsLayout } from '../../components/leads';
import { Card as UICard, Button as UIButton, Badge as UIBadge, Modal as UIModal } from '../../components/ui';
import { LeadForm } from '../../components/forms';
import { useLeads } from '../../hooks/services/useLeads';
import { Lead, LeadStatus, PropertyType, LeadNote, TransactionDetails, StatusChangeHistory, PropertyDetails, ComparableProperty } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import dynamic from 'next/dynamic';
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules (only on client side)
if (typeof window !== 'undefined') {
  ModuleRegistry.registerModules([AllCommunityModule]);
}

// Dynamically import AG Grid to disable SSR
// Dynamically import AG Grid to disable SSR
const AgGridReact = dynamic(() => import('ag-grid-react').then((mod) => mod.AgGridReact), { ssr: false });

const LeadDetailPage: React.FC = () => {
  const router = useRouter();
  const { id, tab, action } = router.query;
  const { leads, loading, error, fetchLeads, updateLead } = useLeads();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isTransactionEditModalOpen, setIsTransactionEditModalOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState<StatusChangeHistory[]>([]);
  const [isLoadingStatusHistory, setIsLoadingStatusHistory] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus | ''>('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [isLoadingPropertyDetails, setIsLoadingPropertyDetails] = useState(false);
  const [isPropertyDetailsEditModalOpen, setIsPropertyDetailsEditModalOpen] = useState(false);
  const leadFormRef = React.useRef<HTMLFormElement>(null);
  const toast = useToast();

  // Mock buyer data - in production this would come from an API
  const mockBuyers = [
    { id: '1', name: 'David Thompson', status: 'Interested', phone: '(555) 987-6543', email: 'david.t@email.com', budget: '$400k - $450k', timeline: '30-60 days', preference: '3+ beds, 2+ baths', matchScore: '95%' },
    { id: '2', name: 'Jennifer Lee', status: 'Scheduled', phone: '(555) 456-7890', email: 'jennifer.l@email.com', budget: '$380k - $420k', timeline: '45-90 days', preference: 'Family home, good schools', matchScore: '88%' }
  ];

  // Route guard - redirect if no ID
  useEffect(() => {
    if (router.isReady && !id) {
      router.push('/leads');
    }
  }, [router.isReady, id, router]);

  useEffect(() => {
    if (id && leads.length > 0) {
      const foundLead = leads.find(l => l.id === id);
      setLead(foundLead || null);
    }
  }, [id, leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Fetch notes when lead ID is available
  useEffect(() => {
    const fetchNotes = async () => {
      if (!id || typeof id !== 'string') return;
      
      setIsLoadingNotes(true);
      try {
        const token = localStorage.getItem('auth_token');
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Only add Authorization header if we have a token or bypass is not enabled
        if (token && !bypassAuth) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/leads/${id}/notes`, {
          headers,
        });

        if (response.ok) {
          const notesData = await response.json();
          // Convert date strings to Date objects
          const notesWithDates = notesData.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }));
          setNotes(notesWithDates);
        } else {
          console.error('Failed to fetch notes');
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    if (router.isReady && id) {
      fetchNotes();
    }
  }, [id, router.isReady]);

  // Fetch transaction details when lead ID is available
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!id || typeof id !== 'string') return;
      
      setIsLoadingTransaction(true);
      try {
        const token = localStorage.getItem('auth_token');
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token && !bypassAuth) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/leads/${id}/transaction`, {
          headers,
        });

        if (response.ok) {
          const transactionData = await response.json();
          // Convert date strings to Date objects
          const transactionWithDates = {
            ...transactionData,
            contractDate: transactionData.contractDate ? new Date(transactionData.contractDate) : undefined,
            inspectionDate: transactionData.inspectionDate ? new Date(transactionData.inspectionDate) : undefined,
            closingDate: transactionData.closingDate ? new Date(transactionData.closingDate) : undefined,
            createdAt: transactionData.createdAt ? new Date(transactionData.createdAt) : undefined,
            updatedAt: transactionData.updatedAt ? new Date(transactionData.updatedAt) : undefined,
          };
          setTransactionDetails(transactionWithDates);
        } else if (response.status === 404) {
          // No transaction details yet, that's okay
          setTransactionDetails(null);
        } else {
          console.error('Failed to fetch transaction details');
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
      } finally {
        setIsLoadingTransaction(false);
      }
    };

    if (router.isReady && id) {
      fetchTransactionDetails();
    }
  }, [id, router.isReady]);

  // Fetch status change history when lead ID is available
  useEffect(() => {
    const fetchStatusHistory = async () => {
      if (!id || typeof id !== 'string') return;
      
      setIsLoadingStatusHistory(true);
      try {
        const token = localStorage.getItem('auth_token');
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token && !bypassAuth) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/leads/${id}/status`, {
          headers,
        });

        if (response.ok) {
          const historyData = await response.json();
          // Convert date strings to Date objects
          const historyWithDates = historyData.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }));
          setStatusHistory(historyWithDates);
        } else {
          console.error('Failed to fetch status history');
        }
      } catch (error) {
        console.error('Error fetching status history:', error);
      } finally {
        setIsLoadingStatusHistory(false);
      }
    };

    if (router.isReady && id) {
      fetchStatusHistory();
    }
  }, [id, router.isReady]);

  // Fetch property details when lead ID is available
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id || typeof id !== 'string') return;
      
      setIsLoadingPropertyDetails(true);
      try {
        const token = localStorage.getItem('auth_token');
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token && !bypassAuth) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/leads/${id}/property-details`, {
          headers,
        });

        if (response.ok) {
          const detailsData = await response.json();
          // Convert date strings to Date objects
          const detailsWithDates = {
            ...detailsData,
            targetCloseDate: detailsData.targetCloseDate ? new Date(detailsData.targetCloseDate) : undefined,
            inspectionPeriodDate: detailsData.inspectionPeriodDate ? new Date(detailsData.inspectionPeriodDate) : undefined,
            emdReceivedDate: detailsData.emdReceivedDate ? new Date(detailsData.emdReceivedDate) : undefined,
            dateOfSignedContract: detailsData.dateOfSignedContract ? new Date(detailsData.dateOfSignedContract) : undefined,
            dateOfPhotosReceived: detailsData.dateOfPhotosReceived ? new Date(detailsData.dateOfPhotosReceived) : undefined,
          };
          setPropertyDetails(detailsWithDates);
        } else if (response.status === 404) {
          // No property details yet, that's okay
          setPropertyDetails(null);
        } else {
          console.error('Failed to fetch property details');
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setIsLoadingPropertyDetails(false);
      }
    };

    if (router.isReady && id) {
      fetchPropertyDetails();
    }
  }, [id, router.isReady]);

  const handleUpdateLead = async (data: any) => {
    if (!lead) return;
    setIsLoading(true);
    try {
      await updateLead(lead.id, data);
      toast({
        title: 'Lead updated successfully',
        status: 'success',
        duration: 3000,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error updating lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
      throw error; // Re-throw so form can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLead = () => {
    // Trigger form submission using requestSubmit (modern form API)
    if (leadFormRef.current) {
      leadFormRef.current.requestSubmit();
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !id || typeof id !== 'string') {
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add notes',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoadingNotes(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      const authorName = `${user.firstName} ${user.lastName}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add Authorization header if we have a token or bypass is not enabled
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!bypassAuth) {
        // If no token and bypass is not enabled, we should have already returned above
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/leads/${id}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: newNote.trim(),
          author: authorName,
          authorId: user.id,
        }),
      });

      if (response.ok) {
        const newNoteData = await response.json();
        // Convert date strings to Date objects
        const noteWithDates = {
          ...newNoteData,
          createdAt: new Date(newNoteData.createdAt),
          updatedAt: new Date(newNoteData.updatedAt),
        };
        
        // Add new note to the beginning of the list (newest first)
        setNotes(prevNotes => [noteWithDates, ...prevNotes]);
        setNewNote('');
        
        toast({
          title: 'Note added',
          description: 'Note has been added successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add note');
      }
    } catch (error) {
      toast({
        title: 'Error adding note',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: 'Message sent',
        description: 'Message has been sent successfully',
        status: 'success',
        duration: 3000,
      });
      setNewMessage('');
    }
  };

  const handleSavePropertyDetails = async (data: Partial<PropertyDetails>) => {
    if (!id || typeof id !== 'string') return;
    
    setIsLoadingPropertyDetails(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/leads/${id}/property-details`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // Convert date strings to Date objects
        const updatedWithDates = {
          ...updatedData,
          targetCloseDate: updatedData.targetCloseDate ? new Date(updatedData.targetCloseDate) : undefined,
          inspectionPeriodDate: updatedData.inspectionPeriodDate ? new Date(updatedData.inspectionPeriodDate) : undefined,
          emdReceivedDate: updatedData.emdReceivedDate ? new Date(updatedData.emdReceivedDate) : undefined,
          dateOfSignedContract: updatedData.dateOfSignedContract ? new Date(updatedData.dateOfSignedContract) : undefined,
          dateOfPhotosReceived: updatedData.dateOfPhotosReceived ? new Date(updatedData.dateOfPhotosReceived) : undefined,
        };
        setPropertyDetails(updatedWithDates);
        setIsPropertyDetailsEditModalOpen(false);
        
        toast({
          title: 'Property details saved',
          description: 'Property details have been updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save property details');
      }
    } catch (error) {
      toast({
        title: 'Error saving property details',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoadingPropertyDetails(false);
    }
  };

  const handleStatusChange = async () => {
    if (!lead || !newStatus || !statusChangeReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a new status and provide a reason',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to change status',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSavingStatus(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      const authorName = `${user.firstName} ${user.lastName}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!bypassAuth) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/leads/${id}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          oldStatus: lead.status,
          newStatus: newStatus,
          reason: statusChangeReason.trim(),
          changedBy: authorName,
          changedById: user.id,
        }),
      });

      if (response.ok) {
        const statusChangeData = await response.json();
        // Convert date strings to Date objects
        const statusChangeWithDates = {
          ...statusChangeData,
          createdAt: new Date(statusChangeData.createdAt),
        };
        
        // Add to history (newest first)
        setStatusHistory(prev => [statusChangeWithDates, ...prev]);
        
        // Update the lead status
        const updatedLead = { ...lead, status: newStatus as LeadStatus };
        setLead(updatedLead);
        
        // Also update in the leads list
        await updateLead(lead.id, { status: newStatus });
        
        // Reset form
        setNewStatus('');
        setStatusChangeReason('');
        setIsStatusChangeModalOpen(false);
        
        toast({
          title: 'Status updated',
          description: `Lead status changed to ${newStatus}`,
          status: 'success',
          duration: 3000,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'green';
      case 'converted': return 'purple';
      case 'lost': return 'red';
      case 'still_on_cloud': return 'orange';
      case 'wants_retail': return 'teal';
      case 'working_with_competitor': return 'red';
      case 'no_longer_want_to_sell': return 'gray';
      case 'not_interested': return 'red';
      case 'rejected_offer': return 'orange';
      case 'interested_not_ready_now': return 'yellow';
      case 'listed_with_realtor': return 'purple';
      default: return 'gray';
    }
  };

  const getPropertyTypeColor = (type: PropertyType) => {
    switch (type) {
      case 'single_family': return 'blue';
      case 'multi_family': return 'green';
      case 'commercial': return 'purple';
      case 'land': return 'orange';
      default: return 'gray';
    }
  };

  // Format timestamp to relative time (e.g., "2 hours ago", "1 day ago")
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Calculate net profit
  const calculateNetProfit = (details: TransactionDetails | null): number => {
    if (!details) return 0;
    const listingPrice = details.listingPrice || 0;
    const acquisitionPrice = details.acquisitionPrice || 0;
    const commission = details.commission || 0;
    const repairCosts = details.repairCosts || 0;
    const closingCosts = details.closingCosts || 0;
    
    return listingPrice - acquisitionPrice - commission - repairCosts - closingCosts;
  };

  // Calculate days under contract
  const calculateDaysUnderContract = (details: TransactionDetails | null): number => {
    if (!details || !details.contractDate) return 0;
    const now = new Date();
    const contractDate = new Date(details.contractDate);
    const diffTime = now.getTime() - contractDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle saving transaction details
  const handleSaveTransactionDetails = async (data: Partial<TransactionDetails>) => {
    if (!id || typeof id !== 'string') return;
    
    setIsLoadingTransaction(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/leads/${id}/transaction`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...data,
          leadId: id,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // Convert date strings to Date objects
        const transactionWithDates = {
          ...updatedData,
          contractDate: updatedData.contractDate ? new Date(updatedData.contractDate) : undefined,
          inspectionDate: updatedData.inspectionDate ? new Date(updatedData.inspectionDate) : undefined,
          closingDate: updatedData.closingDate ? new Date(updatedData.closingDate) : undefined,
          createdAt: updatedData.createdAt ? new Date(updatedData.createdAt) : undefined,
          updatedAt: updatedData.updatedAt ? new Date(updatedData.updatedAt) : undefined,
        };
        setTransactionDetails(transactionWithDates);
        setIsTransactionEditModalOpen(false);
        
        toast({
          title: 'Transaction details saved',
          description: 'Transaction details have been updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save transaction details');
      }
    } catch (error) {
      toast({
        title: 'Error saving transaction details',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoadingTransaction(false);
    }
  };

  if (loading || !router.isReady) {
    return (
      <LeadsLayout loading={true} loadingMessage="Loading lead details...">
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading lead details...</Text>
        </VStack>
      </LeadsLayout>
    );
  }

  if (error) {
    return (
      <LeadsLayout error={error}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="semibold">Error loading lead</Text>
            <Text fontSize="sm">{error}</Text>
            <Button size="sm" onClick={() => router.push('/leads')}>
              Back to Leads
            </Button>
          </VStack>
        </Alert>
      </LeadsLayout>
    );
  }

  if (!lead) {
    return (
      <LeadsLayout>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="semibold">Lead not found</Text>
            <Text fontSize="sm">The requested lead could not be found.</Text>
            <Button size="sm" onClick={() => router.push('/leads')}>
              Back to Leads
            </Button>
          </VStack>
        </Alert>
      </LeadsLayout>
    );
  }

  return (
    <LeadsLayout>
      <Container maxW="1400px" px={8} py={6}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          spacing="8px" 
          separator={<FiChevronRight color="gray.500" />}
          mb={6}
          color="gray.500"
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/leads" color="blue.500">Leads</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Text color="gray.500">{lead.firstName} {lead.lastName} - {lead.address}</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Lead Header */}
        <Box bg="white" borderRadius="12px" p={8} mb={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
          <Flex justify="space-between" align="flex-start" mb={6}>
            <Box>
              <Heading size="lg" mb={2}>
                {lead.firstName} {lead.lastName}
              </Heading>
              <Text color="gray.600" fontSize="lg">
                {lead.address}, {lead.city}, {lead.state} {lead.zipCode}
              </Text>
            </Box>
            <VStack align="end" spacing={2}>
              <HStack spacing={2}>
                <Badge 
                  colorScheme={getStatusColor(lead.status)} 
                  size="lg" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => setIsStatusChangeModalOpen(true)}
                  _hover={{ opacity: 0.8 }}
                  title="Click to change status"
                >
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
                <IconButton
                  aria-label="Change status"
                  icon={<FiEdit />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsStatusChangeModalOpen(true)}
                />
              </HStack>
              <Badge colorScheme="red" px={3} py={1} borderRadius="md">
                High Priority
              </Badge>
            </VStack>
          </Flex>

          {/* Lead Meta Information */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6} p={6} bg="gray.50" borderRadius="8px">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Phone</Text>
              <Text fontWeight="600">{lead.phone}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Estimated Value</Text>
              <Text fontWeight="600">${lead.estimatedValue.toLocaleString()}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Motivation</Text>
              <Text fontWeight="600">Relocation</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Timeline</Text>
              <Text fontWeight="600">30-60 days</Text>
            </VStack>
          </SimpleGrid>

          {/* Quick Actions */}
          <HStack spacing={3} flexWrap="wrap">
            <Button leftIcon={<FiPhone />} colorScheme="blue" size="md">
              Call Lead
            </Button>
            <Button leftIcon={<FiMessageSquare />} variant="outline" size="md">
              Send SMS
            </Button>
            <Button leftIcon={<FiMail />} variant="outline" size="md">
              Send Email
            </Button>
            <Button leftIcon={<FiFileText />} colorScheme="green" size="md">
              Create Offer
            </Button>
            <Button leftIcon={<FiCalendar />} variant="outline" size="md">
              Schedule Follow-up
            </Button>
            <Button leftIcon={<FiX />} colorScheme="red" size="md">
              Mark as Dead
            </Button>
          </HStack>
        </Box>

        {/* Status Banner */}
        <Box 
          bg="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
          border="1px solid"
          borderColor="yellow.400"
          borderRadius="12px"
          p={6}
          mb={6}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Badge bg="yellow.500" color="white" px={4} py={2} borderRadius="full" fontSize="sm">
                Under Contract
              </Badge>
              <Box>
                <Text fontSize="lg" fontWeight="600" color="yellow.800">Active Disposition</Text>
                <Text fontSize="sm" color="yellow.700">Contract signed 7 days ago • Marketing campaign active</Text>
              </Box>
            </HStack>
            <HStack spacing={3}>
              <Button leftIcon={<FiPhone />} variant="outline" size="sm" colorScheme="yellow">
                Launch Campaign
              </Button>
              <Button leftIcon={<FiCalendar />} variant="outline" size="sm" colorScheme="yellow">
                Schedule Showing
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Main Grid Layout */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} alignItems="stretch">
          {/* Left Column */}
          <VStack spacing={6} align="stretch">
            {/* Lead Information Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                    <FiUser size="16" />
                  </Box>
                  <Heading size="md">Lead Information</Heading>
                </HStack>
                <Button leftIcon={<FiEdit />} variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </Button>
              </Flex>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Property Address</Text>
                  <Text fontWeight="600" wordBreak="break-word">{lead.address}, {lead.city}, {lead.state} {lead.zipCode}</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Lead Source</Text>
                  <Text fontWeight="600" wordBreak="break-word">Direct Mail Campaign</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Owner Name</Text>
                  <Text fontWeight="600" wordBreak="break-word">{lead.firstName} {lead.lastName}</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Phone Number</Text>
                  <Text fontWeight="600" wordBreak="break-word">{lead.phone}</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Email Address</Text>
                  <Text 
                    fontWeight="600" 
                    wordBreak="break-all"
                    overflowWrap="break-word"
                    maxW="100%"
                  >
                    {lead.email}
                  </Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Property Type</Text>
                  <Text fontWeight="600" wordBreak="break-word">{lead.propertyType.replace('_', ' ')}</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Bedrooms/Bathrooms</Text>
                  <Text fontWeight="600" wordBreak="break-word">3 bed, 2 bath</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Square Footage</Text>
                  <Text fontWeight="600" wordBreak="break-word">1,800 sq ft</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Occupied</Text>
                  <Text fontWeight="600" wordBreak="break-word">Yes</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Property Access</Text>
                  <Text fontWeight="600" wordBreak="break-word">Owner provides access</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Assigned Agent</Text>
                  <Text fontWeight="600" wordBreak="break-word">Sarah Johnson</Text>
                </VStack>
                <VStack align="start" spacing={2} minW={0} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Created Date</Text>
                  <Text fontWeight="600" wordBreak="break-word">{lead.createdAt.toLocaleDateString()}</Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Property Details Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="blue.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                    <FiHome size="16" />
                  </Box>
                  <Heading size="md">Property Details</Heading>
                </HStack>
                <Button 
                  leftIcon={<FiEdit />} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPropertyDetailsEditModalOpen(true)}
                >
                  Edit
                </Button>
              </Flex>

              {isLoadingPropertyDetails ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="md" />
                </Box>
              ) : !propertyDetails ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="sm" mb={4}>No property details recorded yet.</Text>
                  <Button 
                    size="sm" 
                    colorScheme="blue"
                    onClick={() => setIsPropertyDetailsEditModalOpen(true)}
                  >
                    Add Property Details
                  </Button>
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  {/* Quick Summary */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    {propertyDetails.bedrooms && (
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600">Bedrooms</Text>
                        <Text fontWeight="600">{propertyDetails.bedrooms}</Text>
                      </VStack>
                    )}
                    {propertyDetails.bath && (
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600">Bathrooms</Text>
                        <Text fontWeight="600">{propertyDetails.bath}</Text>
                      </VStack>
                    )}
                    {propertyDetails.yearHouseBuilt && (
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600">Year Built</Text>
                        <Text fontWeight="600">{propertyDetails.yearHouseBuilt}</Text>
                      </VStack>
                    )}
                    {propertyDetails.propertyType && (
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600">Property Type</Text>
                        <Text fontWeight="600">{propertyDetails.propertyType}</Text>
                      </VStack>
                    )}
                  </SimpleGrid>

                  {/* Property Notes */}
                  {propertyDetails.reasonForSelling && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="500" mb={2}>Reason for Selling</Text>
                      <Text>{propertyDetails.reasonForSelling}</Text>
                    </Box>
                  )}

                  {/* Comparables Summary */}
                  {(propertyDetails.soldComparables && propertyDetails.soldComparables.length > 0) ||
                   (propertyDetails.pendingComparables && propertyDetails.pendingComparables.length > 0) ? (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="500" mb={2}>Comparables</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                        {propertyDetails.soldComparables && propertyDetails.soldComparables.length > 0 && (
                          <Text fontSize="sm">
                            <strong>Sold:</strong> {propertyDetails.soldComparables.length} comparable{propertyDetails.soldComparables.length !== 1 ? 's' : ''}
                          </Text>
                        )}
                        {propertyDetails.pendingComparables && propertyDetails.pendingComparables.length > 0 && (
                          <Text fontSize="sm">
                            <strong>Pending:</strong> {propertyDetails.pendingComparables.length} comparable{propertyDetails.pendingComparables.length !== 1 ? 's' : ''}
                          </Text>
                        )}
                      </SimpleGrid>
                    </Box>
                  ) : null}

                  {/* TC Section Summary */}
                  {(propertyDetails.targetCloseDate || propertyDetails.nextStep || propertyDetails.buyerName) && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="500" mb={2}>Transaction Coordination</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                        {propertyDetails.targetCloseDate && (
                          <Text fontSize="sm">
                            <strong>Target Close:</strong> {propertyDetails.targetCloseDate.toLocaleDateString()}
                          </Text>
                        )}
                        {propertyDetails.nextStep && (
                          <Text fontSize="sm">
                            <strong>Next Step:</strong> {propertyDetails.nextStep}
                          </Text>
                        )}
                        {propertyDetails.buyerName && (
                          <Text fontSize="sm">
                            <strong>Buyer:</strong> {propertyDetails.buyerName}
                          </Text>
                        )}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              )}
            </Box>

          </VStack>

          {/* Right Column */}
          <VStack spacing={6} align="stretch" h="100%">
            {/* Transaction Details Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200" flex={1} display="flex" flexDirection="column">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                    <FiDollarSign size="16" />
                  </Box>
                  <Heading size="md">Transaction Details</Heading>
                </HStack>
                <Button 
                  leftIcon={<FiEdit />} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsTransactionEditModalOpen(true)}
                >
                  Edit
                </Button>
              </Flex>

              {/* Financial Summary */}
              <Box 
                bg="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
                border="1px solid"
                borderColor="green.200"
                borderRadius="12px"
                p={6}
                mb={6}
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="lg" fontWeight="600" color="green.800">Financial Summary</Text>
                  <Badge bg="green.500" color="white" px={4} py={2} borderRadius="full" fontSize="sm">
                    {(() => {
                      const profit = calculateNetProfit(transactionDetails);
                      if (profit >= 1000000) {
                        return `$${(profit / 1000000).toFixed(1)}M Profit`;
                      } else if (profit >= 1000) {
                        return `$${(profit / 1000).toFixed(0)}k Profit`;
                      } else {
                        return `$${profit.toLocaleString()} Profit`;
                      }
                    })()}
                  </Badge>
                </Flex>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Acquisition Price</Text>
                    <Text fontSize="lg" fontWeight="700">
                      ${(transactionDetails?.acquisitionPrice || 0).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Listing Price</Text>
                    <Text fontSize="lg" fontWeight="700">
                      ${(transactionDetails?.listingPrice || 0).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Commission</Text>
                    <Text fontSize="lg" fontWeight="700">
                      ${(transactionDetails?.commission || 0).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Repair Costs</Text>
                    <Text fontSize="lg" fontWeight="700">
                      ${(transactionDetails?.repairCosts || 0).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Closing Costs</Text>
                    <Text fontSize="lg" fontWeight="700">
                      ${(transactionDetails?.closingCosts || 0).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Net Profit</Text>
                    <Text fontSize="lg" fontWeight="700" color="green.600">
                      ${calculateNetProfit(transactionDetails).toLocaleString()}
                    </Text>
                  </VStack>
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} flex={1}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Contract Date</Text>
                  <Text fontWeight="600">
                    {transactionDetails?.contractDate 
                      ? transactionDetails.contractDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Not set'}
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Days Under Contract</Text>
                  <Text fontWeight="600" color="orange.500">
                    {calculateDaysUnderContract(transactionDetails)} days
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Inspection Date</Text>
                  <Text fontWeight="600">
                    {transactionDetails?.inspectionDate 
                      ? transactionDetails.inspectionDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Not set'}
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Closing Date</Text>
                  <Text fontWeight="600">
                    {transactionDetails?.closingDate 
                      ? transactionDetails.closingDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Not set'}
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">ARV (After Repair Value)</Text>
                  <Text fontWeight="600">
                    ${(transactionDetails?.arv || 0).toLocaleString()}
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Estimated Repairs</Text>
                  <Text fontWeight="600">
                    ${(transactionDetails?.estimatedRepairs || 0).toLocaleString()}
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

          </VStack>
        </Grid>

        {/* Buyer Information & Documents - Tabbed Pane - Full Width */}
        <Box 
          bg="white" 
          borderRadius="12px" 
          p={6} 
          boxShadow="sm" 
          border="1px solid" 
          borderColor="gray.200"
          mt={8}
          w="100%"
        >
          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiUsers size="16" />
                  <Text>Buyer Information</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiFile size="16" />
                  <Text>Documents</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiMessageCircle size="16" />
                  <Text>Communication History</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiClock size="16" />
                  <Text>Activity Timeline</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiBookmark size="16" />
                  <Text>Notes</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiClock size="16" />
                  <Text>Status Change History</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Buyer Information Tab */}
              <TabPanel p={6}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">Buyer Information</Heading>
                  <Button leftIcon={<FiPlus />} variant="outline" size="sm">
                    Add Buyer
                  </Button>
                </Flex>

                <Box h="600px" w="100%" className="ag-theme-alpine">
                  <AgGridReact
                    rowData={mockBuyers}
                    rowHeight={140}
                    columnDefs={[
                      { field: 'name', headerName: 'Name', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
                      { 
                        field: 'status', 
                        headerName: 'Status', 
                        sortable: true, 
                        filter: 'agTextColumnFilter',
                        cellRenderer: (params: ICellRendererParams) => (
                          <Badge bg="green.100" color="green.700" px={2} py={1} borderRadius="12px" fontSize="xs">
                            {params.value}
                          </Badge>
                        ),
                        width: 120
                      },
                      { field: 'phone', headerName: 'Phone', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
                      { field: 'email', headerName: 'Email', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
                      { field: 'budget', headerName: 'Budget', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
                      { field: 'timeline', headerName: 'Timeline', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
                      { field: 'preference', headerName: 'Preference', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
                      { 
                        field: 'matchScore', 
                        headerName: 'Match Score', 
                        sortable: true, 
                        filter: 'agTextColumnFilter',
                        cellRenderer: (params: ICellRendererParams) => (
                          <Text color="green.600" fontWeight="500">{params.value}</Text>
                        ),
                        width: 120
                      },
                      {
                        headerName: 'Actions',
                        sortable: false,
                        filter: false,
                        cellRenderer: (params: ICellRendererParams) => {
                          const buyer = params.data;
                          if (!buyer) return null;

                          const handleOfferPriceStatus = () => {
                            console.log('OfferPrice/Status clicked for buyer:', buyer.id);
                            // TODO: Implement offer price/status functionality
                          };

                          const handleSendSMS = () => {
                            console.log('SendSMS clicked for buyer:', buyer.id);
                            // TODO: Implement SMS sending functionality
                          };

                          const handleCallBack = () => {
                            console.log('CallBack clicked for buyer:', buyer.id);
                            // TODO: Implement callback scheduling functionality
                          };

                          const handleEditBuyer = () => {
                            console.log('EditBuyer clicked for buyer:', buyer.id);
                            // TODO: Implement buyer editing functionality
                          };

                          return (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="stretch"
                              justifyContent="center"
                              width="100%"
                              height="100%"
                              padding="4px"
                              gap="4px"
                            >
                              <Button
                                size="xs"
                                bg="teal.500"
                                color="white"
                                _hover={{ bg: 'teal.600' }}
                                borderRadius="md"
                                fontSize="xs"
                                fontWeight="medium"
                                onClick={handleOfferPriceStatus}
                                whiteSpace="nowrap"
                                py={1.5}
                                px={2}
                                minH="28px"
                                height="28px"
                                width="100%"
                              >
                                OfferPrice/Status
                              </Button>
                              <Button
                                size="xs"
                                bg="teal.500"
                                color="white"
                                _hover={{ bg: 'teal.600' }}
                                borderRadius="md"
                                fontSize="xs"
                                fontWeight="medium"
                                onClick={handleSendSMS}
                                py={1.5}
                                px={2}
                                minH="28px"
                                height="28px"
                                width="100%"
                              >
                                SendSMS
                              </Button>
                              <Button
                                size="xs"
                                bg="teal.500"
                                color="white"
                                _hover={{ bg: 'teal.600' }}
                                borderRadius="md"
                                fontSize="xs"
                                fontWeight="medium"
                                onClick={handleCallBack}
                                py={1.5}
                                px={2}
                                minH="28px"
                                height="28px"
                                width="100%"
                              >
                                CallBack
                              </Button>
                              <Button
                                size="xs"
                                bg="teal.500"
                                color="white"
                                _hover={{ bg: 'teal.600' }}
                                borderRadius="md"
                                fontSize="xs"
                                fontWeight="medium"
                                onClick={handleEditBuyer}
                                py={1.5}
                                px={2}
                                minH="28px"
                                height="28px"
                                width="100%"
                              >
                                EditBuyer
                              </Button>
                            </Box>
                          );
                        },
                        width: 160,
                        pinned: 'right',
                        cellStyle: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4px', overflow: 'visible' },
                        headerClass: 'ag-center-header',
                        suppressSizeToFit: true,
                        cellClass: 'buyer-actions-cell',
                      }
                    ]}
                    defaultColDef={{
                      resizable: true,
                    }}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    theme="legacy"
                  />
                </Box>
              </TabPanel>

              {/* Documents Tab */}
              <TabPanel p={6}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">Documents</Heading>
                  <Button leftIcon={<FiPlus />} variant="outline" size="sm">
                    Upload
                  </Button>
                </Flex>

                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                  {[
                    { name: 'Purchase Contract', type: 'PDF', size: '2.3 MB', date: 'Dec 10, 2024', icon: FiFileText },
                    { name: 'Property Photos', type: 'ZIP', size: '15.7 MB', date: 'Dec 10, 2024', icon: FiFile },
                    { name: 'Market Analysis', type: 'PDF', size: '1.1 MB', date: 'Dec 11, 2024', icon: FiFile },
                    { name: 'Inspection Report', type: 'PDF', size: '3.2 MB', date: 'Dec 15, 2024', icon: FiFile },
                    { name: 'Repair Estimate', type: 'PDF', size: '0.8 MB', date: 'Dec 12, 2024', icon: FiFile },
                    { name: 'Title Report', type: 'PDF', size: '1.5 MB', date: 'Dec 13, 2024', icon: FiFile }
                  ].map((doc, index) => (
                    <Box 
                      key={index}
                      bg="gray.50" 
                      border="1px solid" 
                      borderColor="gray.200" 
                      borderRadius="8px" 
                      p={4} 
                      cursor="pointer"
                      _hover={{ bg: 'gray.100', borderColor: 'gray.300' }}
                      transition="all 0.2s"
                    >
                      <Box 
                        w={10} 
                        h={10} 
                        bg="purple.500" 
                        color="white" 
                        borderRadius="8px" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        mb={3}
                      >
                        <doc.icon size="20" />
                      </Box>
                      <Text fontWeight="600" color="gray.800" mb={1} fontSize="sm">{doc.name}</Text>
                      <Text fontSize="xs" color="gray.600">{doc.type} • {doc.size} • {doc.date}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </TabPanel>

              {/* Communication History Tab */}
              <TabPanel p={6}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">Communication History</Heading>
                  <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
                    New Message
                  </Button>
                </Flex>

                <VStack spacing={4} align="stretch">
                  {[
                    { author: 'John Smith', time: '2 hours ago', message: 'Hi, I\'m interested in selling my house quickly. I\'m relocating for work and need to move out by the end of the month. The house needs some repairs but I\'m willing to sell below market value.', type: 'SMS' },
                    { author: 'Sarah Johnson (You)', time: '1 hour ago', message: 'Hi John, thanks for reaching out. I\'d love to help you sell your house quickly. Can you tell me a bit more about the repairs needed and what you\'re hoping to get for the property?', type: 'SMS' },
                    { author: 'John Smith', time: '45 minutes ago', message: 'The kitchen needs new countertops and the master bathroom needs updating. There\'s also some water damage in the basement. I\'m thinking around $400k but I\'m flexible if you can close quickly.', type: 'SMS' }
                  ].map((comm, index) => (
                    <HStack key={index} spacing={4} p={4} bg="gray.50" borderRadius="8px">
                      <Avatar size="md" name={comm.author} bg="blue.500" />
                      <Box flex={1}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontWeight="600" color="gray.800">{comm.author}</Text>
                          <Text fontSize="sm" color="gray.600">{comm.time}</Text>
                        </Flex>
                        <Text color="gray.700" mb={2} lineHeight="1.5">{comm.message}</Text>
                        <Badge bg="blue.100" color="blue.700" px={2} py={1} borderRadius="4px" fontSize="xs">
                          <FiMessageSquare style={{ display: 'inline', marginRight: '4px' }} />
                          {comm.type}
                        </Badge>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </TabPanel>

              {/* Activity Timeline Tab */}
              <TabPanel p={6}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">Activity Timeline</Heading>
                </Flex>

                <VStack spacing={4} align="stretch">
                  {[
                    { action: 'Marketing Campaign Launched', description: 'Facebook and Instagram ads started for property listing', time: '2 hours ago', icon: FiPhone },
                    { action: 'Owner Contacted', description: 'Called owner to discuss showing schedule', time: '1 day ago', icon: FiPhone },
                    { action: 'Contract Signed', description: 'Purchase contract executed with owner', time: '7 days ago', icon: FiFileText },
                    { action: 'Property Inspection', description: 'Home inspection completed, minor issues found', time: '7 days ago', icon: FiFile },
                    { action: 'Lead Created', description: 'Lead added to system from direct mail campaign', time: '14 days ago', icon: FiPlus }
                  ].map((activity, index) => (
                    <HStack key={index} spacing={4} p={4} borderBottom="1px solid" borderColor="gray.100">
                      <Box 
                        w={8} 
                        h={8} 
                        bg="purple.500" 
                        color="white" 
                        borderRadius="50%" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <activity.icon size="16" />
                      </Box>
                      <Box flex={1}>
                        <Text fontWeight="600" color="gray.800" mb={1}>{activity.action}</Text>
                        <Text color="gray.600" fontSize="sm" mb={1}>{activity.description}</Text>
                        <Text color="gray.500" fontSize="xs">{activity.time}</Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </TabPanel>

              {/* Notes Tab */}
              <TabPanel p={6}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">Notes</Heading>
                </Flex>

                <VStack spacing={4} align="stretch">
                  <Textarea 
                    placeholder="Add a note about this lead..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    size="sm"
                    minH="100px"
                    isDisabled={isLoadingNotes}
                  />
                  <Button 
                    leftIcon={<FiPlus />} 
                    colorScheme="blue" 
                    size="sm" 
                    onClick={handleAddNote}
                    isLoading={isLoadingNotes}
                    isDisabled={!newNote.trim() || isLoadingNotes}
                  >
                    Add Note
                  </Button>

                  {isLoadingNotes && notes.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Spinner size="sm" color="purple.500" />
                      <Text color="gray.500" fontSize="sm" mt={2}>Loading notes...</Text>
                    </Box>
                  ) : notes.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="sm">No notes yet. Add your first note above.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {notes.map((note) => (
                        <Box key={note.id} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="600" color="gray.800">{note.author}</Text>
                            <Text color="gray.500" fontSize="xs">{formatTimeAgo(note.createdAt)}</Text>
                          </Flex>
                          <Text color="gray.700" fontSize="sm" lineHeight="1.5">{note.content}</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              {/* Status Change History Tab */}
              <TabPanel p={6}>
                <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="md">Status Change History</Heading>
                </Flex>

                <VStack spacing={4} align="stretch">
                  {isLoadingStatusHistory ? (
                    <Box textAlign="center" py={8}>
                      <Spinner size="md" />
                    </Box>
                  ) : statusHistory.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="sm">No status changes recorded yet.</Text>
                    </Box>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {statusHistory.map((change) => (
                        <Box key={change.id} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
                          <Flex justify="space-between" align="center" mb={2}>
                            <HStack spacing={2}>
                              <Badge colorScheme={getStatusColor(change.oldStatus)} size="sm">
                                {change.oldStatus}
                              </Badge>
                              <Text color="gray.500" fontSize="sm">→</Text>
                              <Badge colorScheme={getStatusColor(change.newStatus)} size="sm">
                                {change.newStatus}
                              </Badge>
                            </HStack>
                            <Text color="gray.500" fontSize="xs">{formatTimeAgo(change.createdAt)}</Text>
                          </Flex>
                          <Text color="gray.700" fontSize="sm" lineHeight="1.5" mb={2} fontWeight="500">
                            Reason:
                          </Text>
                          <Text color="gray.700" fontSize="sm" lineHeight="1.5" mb={2}>
                            {change.reason}
                          </Text>
                          <Text color="gray.500" fontSize="xs">
                            Changed by {change.changedBy}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* AI Suggestions Section */}
        <Box 
          bg="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
          borderRadius="12px"
          p={6}
          color="white"
          mt={8}
          w="100%"
        >
          <HStack spacing={3} mb={4}>
            <Box w={8} h={8} bg="rgba(255, 255, 255, 0.2)" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
              <FiZap size="16" />
            </Box>
            <Heading size="md">AI Suggestions</Heading>
          </HStack>

          <VStack spacing={4} align="stretch">
            {[
              { title: 'Recommended Next Action', content: 'Schedule a property inspection within 24 hours. The lead shows high motivation and the timeline is urgent.', actions: ['Schedule Inspection', 'Dismiss'] },
              { title: 'Communication Template', content: '"Hi John, I\'d like to schedule a quick property inspection to give you the best offer possible. Would tomorrow work for you?"', actions: ['Use Template', 'Edit'] }
            ].map((suggestion, index) => (
              <Box key={index} bg="rgba(255, 255, 255, 0.1)" borderRadius="8px" p={4}>
                <Text fontWeight="600" mb={2}>{suggestion.title}</Text>
                <Text opacity="0.9" lineHeight="1.5" mb={3}>{suggestion.content}</Text>
                <HStack spacing={2}>
                  {suggestion.actions.map((action, actionIndex) => (
                    <Button key={actionIndex} variant="outline" size="sm" bg="transparent" borderColor="rgba(255, 255, 255, 0.3)" color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>
                      {action}
                    </Button>
                  ))}
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      </Container>

      {/* Edit Lead Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Lead</ModalHeader>
          <ModalBody>
            <LeadForm 
              onSubmit={handleUpdateLead}
              initialData={lead}
              hideSubmitButton={true}
              isLoading={isLoading}
              formRef={leadFormRef}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveLead}
              isLoading={isLoading}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Transaction Details Modal */}
      <Modal 
        isOpen={isTransactionEditModalOpen} 
        onClose={() => setIsTransactionEditModalOpen(false)} 
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Transaction Details</ModalHeader>
          <ModalBody>
            <TransactionDetailsEditForm
              transactionDetails={transactionDetails}
              onSave={handleSaveTransactionDetails}
              onCancel={() => setIsTransactionEditModalOpen(false)}
              isLoading={isLoadingTransaction}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Property Details Modal */}
      <Modal 
        isOpen={isPropertyDetailsEditModalOpen} 
        onClose={() => setIsPropertyDetailsEditModalOpen(false)} 
        size="full"
      >
        <ModalOverlay />
        <ModalContent maxW="95vw" maxH="95vh">
          <ModalHeader>Property Details</ModalHeader>
          <ModalBody overflowY="auto">
            <PropertyDetailsEditForm
              propertyDetails={propertyDetails}
              onSave={handleSavePropertyDetails}
              onCancel={() => setIsPropertyDetailsEditModalOpen(false)}
              isLoading={isLoadingPropertyDetails}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Change Status Modal */}
      <Modal 
        isOpen={isStatusChangeModalOpen} 
        onClose={() => {
          setIsStatusChangeModalOpen(false);
          setNewStatus('');
          setStatusChangeReason('');
        }} 
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Lead Status</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Current Status</FormLabel>
                <Input value={lead?.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : ''} isReadOnly />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>New Status</FormLabel>
                <Select
                  placeholder="Select new status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                  <option value="still_on_cloud">Still on Cloud</option>
                  <option value="wants_retail">Wants Retail</option>
                  <option value="working_with_competitor">Working with Competitor</option>
                  <option value="no_longer_want_to_sell">No Longer Want to Sell</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="rejected_offer">Rejected Offer</option>
                  <option value="interested_not_ready_now">Interested Not Ready Now</option>
                  <option value="listed_with_realtor">Listed with Realtor</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Reason for Status Change</FormLabel>
                <Textarea
                  placeholder="Explain why the status is being changed..."
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  minH="120px"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsStatusChangeModalOpen(false);
                  setNewStatus('');
                  setStatusChangeReason('');
                }}
                isDisabled={isSavingStatus}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleStatusChange}
                isLoading={isSavingStatus}
                isDisabled={!newStatus || !statusChangeReason.trim()}
              >
                Save Status Change
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LeadsLayout>
  );
};

// Transaction Details Edit Form Component
interface TransactionDetailsEditFormProps {
  transactionDetails: TransactionDetails | null;
  onSave: (data: Partial<TransactionDetails>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const TransactionDetailsEditForm: React.FC<TransactionDetailsEditFormProps> = ({
  transactionDetails,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<TransactionDetails>>({
    acquisitionPrice: transactionDetails?.acquisitionPrice || 0,
    listingPrice: transactionDetails?.listingPrice || 0,
    commission: transactionDetails?.commission || 0,
    repairCosts: transactionDetails?.repairCosts || 0,
    closingCosts: transactionDetails?.closingCosts || 0,
    contractDate: transactionDetails?.contractDate,
    inspectionDate: transactionDetails?.inspectionDate,
    closingDate: transactionDetails?.closingDate,
    arv: transactionDetails?.arv || 0,
    estimatedRepairs: transactionDetails?.estimatedRepairs || 0,
  });

  useEffect(() => {
    if (transactionDetails) {
      setFormData({
        acquisitionPrice: transactionDetails.acquisitionPrice || 0,
        listingPrice: transactionDetails.listingPrice || 0,
        commission: transactionDetails.commission || 0,
        repairCosts: transactionDetails.repairCosts || 0,
        closingCosts: transactionDetails.closingCosts || 0,
        contractDate: transactionDetails.contractDate,
        inspectionDate: transactionDetails.inspectionDate,
        closingDate: transactionDetails.closingDate,
        arv: transactionDetails.arv || 0,
        estimatedRepairs: transactionDetails.estimatedRepairs || 0,
      });
    }
  }, [transactionDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Financial Fields */}
        <Box>
          <Heading size="sm" mb={4}>Financial Summary</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Acquisition Price</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.acquisitionPrice || ''}
                  onChange={(e) => setFormData({ ...formData, acquisitionPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Listing Price</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.listingPrice || ''}
                  onChange={(e) => setFormData({ ...formData, listingPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Commission</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.commission || ''}
                  onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Repair Costs</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.repairCosts || ''}
                  onChange={(e) => setFormData({ ...formData, repairCosts: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Closing Costs</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.closingCosts || ''}
                  onChange={(e) => setFormData({ ...formData, closingCosts: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>ARV (After Repair Value)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.arv || ''}
                  onChange={(e) => setFormData({ ...formData, arv: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Estimated Repairs</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                  $
                </InputLeftElement>
                <Input
                  type="number"
                  value={formData.estimatedRepairs || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedRepairs: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Date Fields */}
        <Box>
          <Heading size="sm" mb={4}>Important Dates</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Contract Date</FormLabel>
              <Input
                type="date"
                value={formatDateForInput(formData.contractDate)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contractDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Inspection Date</FormLabel>
              <Input
                type="date"
                value={formatDateForInput(formData.inspectionDate)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  inspectionDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Closing Date</FormLabel>
              <Input
                type="date"
                value={formatDateForInput(formData.closingDate)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  closingDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Net Profit Display */}
        <Box 
          bg="green.50" 
          border="1px solid" 
          borderColor="green.200" 
          borderRadius="8px" 
          p={4}
        >
          <Text fontSize="sm" color="green.700" mb={2}>Calculated Net Profit</Text>
          <Text fontSize="xl" fontWeight="700" color="green.600">
            ${(() => {
              const listingPrice = formData.listingPrice || 0;
              const acquisitionPrice = formData.acquisitionPrice || 0;
              const commission = formData.commission || 0;
              const repairCosts = formData.repairCosts || 0;
              const closingCosts = formData.closingCosts || 0;
              return (listingPrice - acquisitionPrice - commission - repairCosts - closingCosts).toLocaleString();
            })()}
          </Text>
        </Box>
      </VStack>

      <ModalFooter mt={6}>
        <Button variant="ghost" mr={3} onClick={onCancel} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button 
          colorScheme="blue" 
          type="submit" 
          isLoading={isLoading}
        >
          Save Changes
        </Button>
      </ModalFooter>
    </form>
  );
};

// Property Details Edit Form Component
interface PropertyDetailsEditFormProps {
  propertyDetails: PropertyDetails | null;
  onSave: (data: Partial<PropertyDetails>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PropertyDetailsEditForm: React.FC<PropertyDetailsEditFormProps> = ({
  propertyDetails,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<PropertyDetails>>(
    propertyDetails || {
      soldComparables: [],
      pendingComparables: [],
      cashComparables: [],
      rentalsComparables: [],
    }
  );

  useEffect(() => {
    if (propertyDetails) {
      setFormData(propertyDetails);
    }
  }, [propertyDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const addComparable = (type: 'sold' | 'pending' | 'cash' | 'rentals') => {
    const key = `${type}Comparables` as keyof PropertyDetails;
    const comparables = (formData[key] as ComparableProperty[]) || [];
    const newComparable: ComparableProperty = {
      id: `comp-${Date.now()}`,
      link: '',
      price: 0,
    };
    setFormData({
      ...formData,
      [key]: [...comparables, newComparable],
    });
  };

  const updateComparable = (type: 'sold' | 'pending' | 'cash' | 'rentals', index: number, field: keyof ComparableProperty, value: any) => {
    const key = `${type}Comparables` as keyof PropertyDetails;
    const comparables = [...((formData[key] as ComparableProperty[]) || [])];
    comparables[index] = { ...comparables[index], [field]: value };
    setFormData({
      ...formData,
      [key]: comparables,
    });
  };

  const removeComparable = (type: 'sold' | 'pending' | 'cash' | 'rentals', index: number) => {
    const key = `${type}Comparables` as keyof PropertyDetails;
    const comparables = [...((formData[key] as ComparableProperty[]) || [])];
    comparables.splice(index, 1);
    setFormData({
      ...formData,
      [key]: comparables,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs colorScheme="blue">
        <TabList>
          <Tab>Property Info</Tab>
          <Tab>HVAC & Systems</Tab>
          <Tab>Appliances</Tab>
          <Tab>Property Status</Tab>
          <Tab>Financials</Tab>
          <Tab>Comparables</Tab>
          <Tab>Mortgage & TC</Tab>
          <Tab>Notes</Tab>
        </TabList>

        <TabPanels>
          {/* Property Info Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Year House Built</FormLabel>
                <Input
                  type="number"
                  value={formData.yearHouseBuilt || ''}
                  onChange={(e) => setFormData({ ...formData, yearHouseBuilt: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Year House Purchased</FormLabel>
                <Input
                  type="number"
                  value={formData.yearHousePurchased || ''}
                  onChange={(e) => setFormData({ ...formData, yearHousePurchased: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Permitted</FormLabel>
                <Select
                  value={formData.permitted || ''}
                  onChange={(e) => setFormData({ ...formData, permitted: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Lot Size</FormLabel>
                <Input
                  value={formData.lotSize || ''}
                  onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Customer SQ FT</FormLabel>
                <Input
                  type="number"
                  value={formData.customerSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, customerSqFt: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Zillow SQ FT</FormLabel>
                <Input
                  type="number"
                  value={formData.zillowSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, zillowSqFt: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Propstream SQ FT</FormLabel>
                <Input
                  type="number"
                  value={formData.propstreamSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, propstreamSqFt: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Property Type</FormLabel>
                <Select
                  value={formData.propertyType || ''}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Single Family">Single Family</option>
                  <option value="Multi Family">Multi Family</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Block or Wood Frame</FormLabel>
                <Select
                  value={formData.blockOrWoodFrame || ''}
                  onChange={(e) => setFormData({ ...formData, blockOrWoodFrame: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Block">Block</option>
                  <option value="Wood Frame">Wood Frame</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bedrooms</FormLabel>
                <Select
                  value={formData.bedrooms || ''}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                >
                  <option value="">Select...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n.toString()}>{n}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bedrooms Permitted</FormLabel>
                <Select
                  value={formData.bedroomsPermitted || ''}
                  onChange={(e) => setFormData({ ...formData, bedroomsPermitted: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bath</FormLabel>
                <Select
                  value={formData.bath || ''}
                  onChange={(e) => setFormData({ ...formData, bath: e.target.value })}
                >
                  <option value="">Select...</option>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(n => <option key={n} value={n.toString()}>{n}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Bath Permitted</FormLabel>
                <Select
                  value={formData.bathPermitted || ''}
                  onChange={(e) => setFormData({ ...formData, bathPermitted: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Foundation</FormLabel>
                <Select
                  value={formData.foundation || ''}
                  onChange={(e) => setFormData({ ...formData, foundation: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Slab">Slab</option>
                  <option value="Crawl Space">Crawl Space</option>
                  <option value="Basement">Basement</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Garage</FormLabel>
                <Select
                  value={formData.garage || ''}
                  onChange={(e) => setFormData({ ...formData, garage: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Pool</FormLabel>
                <Select
                  value={formData.pool || ''}
                  onChange={(e) => setFormData({ ...formData, pool: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Pool Functional</FormLabel>
                <Select
                  value={formData.poolFunctional || ''}
                  onChange={(e) => setFormData({ ...formData, poolFunctional: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Age of Windows</FormLabel>
                <Input
                  type="number"
                  value={formData.ageOfWindows || ''}
                  onChange={(e) => setFormData({ ...formData, ageOfWindows: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Flood Zone</FormLabel>
                <Select
                  value={formData.floodZone || ''}
                  onChange={(e) => setFormData({ ...formData, floodZone: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="A">A</option>
                  <option value="AE">AE</option>
                  <option value="X">X</option>
                  <option value="None">None</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </TabPanel>

          {/* HVAC & Systems Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Year of Outside AC Unit</FormLabel>
                <Input
                  type="number"
                  value={formData.yearOutsideACUnit || ''}
                  onChange={(e) => setFormData({ ...formData, yearOutsideACUnit: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Year of Inside HVAC</FormLabel>
                <Input
                  type="number"
                  value={formData.yearInsideHVAC || ''}
                  onChange={(e) => setFormData({ ...formData, yearInsideHVAC: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Air Conditioning</FormLabel>
                <Select
                  value={formData.airConditioning || ''}
                  onChange={(e) => setFormData({ ...formData, airConditioning: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Central">Central</option>
                  <option value="Window Units">Window Units</option>
                  <option value="None">None</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Year Roof</FormLabel>
                <Input
                  type="number"
                  value={formData.yearRoof || ''}
                  onChange={(e) => setFormData({ ...formData, yearRoof: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Age of Hot Water Heater</FormLabel>
                <Input
                  type="number"
                  value={formData.ageOfHotWaterHeater || ''}
                  onChange={(e) => setFormData({ ...formData, ageOfHotWaterHeater: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Any Plumbing Issues</FormLabel>
                <Select
                  value={formData.anyPlumbingIssues || ''}
                  onChange={(e) => setFormData({ ...formData, anyPlumbingIssues: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Type of Plumbing</FormLabel>
                <Select
                  value={formData.typeOfPlumbing || ''}
                  onChange={(e) => setFormData({ ...formData, typeOfPlumbing: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Copper">Copper</option>
                  <option value="PVC">PVC</option>
                  <option value="PEX">PEX</option>
                  <option value="Galvanized">Galvanized</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Age of Electrical Panel</FormLabel>
                <Input
                  type="number"
                  value={formData.ageOfElectricalPanel || ''}
                  onChange={(e) => setFormData({ ...formData, ageOfElectricalPanel: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Electrical</FormLabel>
                <Select
                  value={formData.electrical || ''}
                  onChange={(e) => setFormData({ ...formData, electrical: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="200 Amp">200 Amp</option>
                  <option value="100 Amp">100 Amp</option>
                  <option value="60 Amp">60 Amp</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Heat Source</FormLabel>
                <Select
                  value={formData.heatSource || ''}
                  onChange={(e) => setFormData({ ...formData, heatSource: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Electric">Electric</option>
                  <option value="Gas">Gas</option>
                  <option value="Propane">Propane</option>
                  <option value="Oil">Oil</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Propane Last Serviced</FormLabel>
                <Input
                  value={formData.propaneLastServiced || ''}
                  onChange={(e) => setFormData({ ...formData, propaneLastServiced: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Propane Tank Owned By</FormLabel>
                <Select
                  value={formData.propaneTankOwnedBy || ''}
                  onChange={(e) => setFormData({ ...formData, propaneTankOwnedBy: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Owner">Owner</option>
                  <option value="Company">Company</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Water</FormLabel>
                <Select
                  value={formData.water || ''}
                  onChange={(e) => setFormData({ ...formData, water: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="City">City</option>
                  <option value="Well">Well</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Well Last Serviced</FormLabel>
                <Input
                  value={formData.wellLastServiced || ''}
                  onChange={(e) => setFormData({ ...formData, wellLastServiced: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Well Pump Age</FormLabel>
                <Input
                  type="number"
                  value={formData.wellPumpAge || ''}
                  onChange={(e) => setFormData({ ...formData, wellPumpAge: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Waste</FormLabel>
                <Select
                  value={formData.waste || ''}
                  onChange={(e) => setFormData({ ...formData, waste: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="City Sewer">City Sewer</option>
                  <option value="Septic">Septic</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Septic Last Serviced</FormLabel>
                <Input
                  value={formData.septicLastServiced || ''}
                  onChange={(e) => setFormData({ ...formData, septicLastServiced: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Septic Tank Age</FormLabel>
                <Input
                  type="number"
                  value={formData.septicTankAge || ''}
                  onChange={(e) => setFormData({ ...formData, septicTankAge: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Electric</FormLabel>
                <Select
                  value={formData.electric || ''}
                  onChange={(e) => setFormData({ ...formData, electric: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Gas</FormLabel>
                <Select
                  value={formData.gas || ''}
                  onChange={(e) => setFormData({ ...formData, gas: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </TabPanel>

          {/* Appliances Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Microwave Built In</FormLabel>
                <Select
                  value={formData.microwaveBuiltIn || ''}
                  onChange={(e) => setFormData({ ...formData, microwaveBuiltIn: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Stove Age</FormLabel>
                <Input
                  type="number"
                  value={formData.stoveAge || ''}
                  onChange={(e) => setFormData({ ...formData, stoveAge: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Stove Color</FormLabel>
                <Input
                  value={formData.stoveColor || ''}
                  onChange={(e) => setFormData({ ...formData, stoveColor: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Stove</FormLabel>
                <Select
                  value={formData.stove || ''}
                  onChange={(e) => setFormData({ ...formData, stove: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Gas">Gas</option>
                  <option value="Electric">Electric</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Fridge Age</FormLabel>
                <Input
                  type="number"
                  value={formData.fridgeAge || ''}
                  onChange={(e) => setFormData({ ...formData, fridgeAge: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fridge Color</FormLabel>
                <Input
                  value={formData.fridgeColor || ''}
                  onChange={(e) => setFormData({ ...formData, fridgeColor: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Fridge</FormLabel>
                <Select
                  value={formData.fridge || ''}
                  onChange={(e) => setFormData({ ...formData, fridge: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Washer Age</FormLabel>
                <Input
                  type="number"
                  value={formData.washerAge || ''}
                  onChange={(e) => setFormData({ ...formData, washerAge: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Washer Color</FormLabel>
                <Input
                  value={formData.washerColor || ''}
                  onChange={(e) => setFormData({ ...formData, washerColor: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Washer</FormLabel>
                <Select
                  value={formData.washer || ''}
                  onChange={(e) => setFormData({ ...formData, washer: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Dryer Age</FormLabel>
                <Input
                  type="number"
                  value={formData.dryerAge || ''}
                  onChange={(e) => setFormData({ ...formData, dryerAge: parseInt(e.target.value) || undefined })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Dryer Color</FormLabel>
                <Input
                  value={formData.dryerColor || ''}
                  onChange={(e) => setFormData({ ...formData, dryerColor: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Dryer</FormLabel>
                <Select
                  value={formData.dryer || ''}
                  onChange={(e) => setFormData({ ...formData, dryer: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </TabPanel>

          {/* Property Status Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>HOA</FormLabel>
                <Select
                  value={formData.hoa || ''}
                  onChange={(e) => setFormData({ ...formData, hoa: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Rental Restrictions</FormLabel>
                <Select
                  value={formData.rentalRestrictions || ''}
                  onChange={(e) => setFormData({ ...formData, rentalRestrictions: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Liens</FormLabel>
                <Select
                  value={formData.liens || ''}
                  onChange={(e) => setFormData({ ...formData, liens: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Property Occupied</FormLabel>
                <Select
                  value={formData.propertyOccupied || ''}
                  onChange={(e) => setFormData({ ...formData, propertyOccupied: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>How Long Vacant</FormLabel>
                <Input
                  value={formData.howLongVacant || ''}
                  onChange={(e) => setFormData({ ...formData, howLongVacant: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>When Will it be Vacated</FormLabel>
                <Input
                  value={formData.whenWillItBeVacated || ''}
                  onChange={(e) => setFormData({ ...formData, whenWillItBeVacated: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Length of Lease</FormLabel>
                <Input
                  value={formData.lengthOfLease || ''}
                  onChange={(e) => setFormData({ ...formData, lengthOfLease: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Lease Ends</FormLabel>
                <Input
                  value={formData.leaseEnds || ''}
                  onChange={(e) => setFormData({ ...formData, leaseEnds: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount of Rent</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                    $
                  </InputLeftElement>
                  <Input
                    type="number"
                    value={formData.amountOfRent || ''}
                    onChange={(e) => setFormData({ ...formData, amountOfRent: parseFloat(e.target.value) || undefined })}
                    pl="2.5rem"
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>
          </TabPanel>

          {/* Financials Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="sm">Acquisition Property Financials</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Customer Asking Price</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.customerAskingPrice || ''}
                      onChange={(e) => setFormData({ ...formData, customerAskingPrice: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>ARV Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionARVMin || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionARVMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>ARV Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionARVMax || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionARVMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Rehab Estimate Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionRehabEstimateMin || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionRehabEstimateMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Rehab Estimate Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionRehabEstimateMax || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionRehabEstimateMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Offer Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionOfferMin || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionOfferMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Offer Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionOfferMax || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionOfferMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Sell at Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionSellAtMin || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionSellAtMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Sell at Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.acquisitionSellAtMax || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionSellAtMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Heading size="sm">Disposition Property Financials</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>ARV Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionARVMin || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionARVMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>ARV Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionARVMax || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionARVMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Rehab Estimate Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionRehabEstimateMin || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionRehabEstimateMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Rehab Estimate Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionRehabEstimateMax || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionRehabEstimateMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Offer Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionOfferMin || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionOfferMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Offer Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionOfferMax || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionOfferMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Sell at Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionSellAtMin || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionSellAtMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Sell at Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.dispositionSellAtMax || ''}
                      onChange={(e) => setFormData({ ...formData, dispositionSellAtMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Investor Profit Range (Min)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.investorProfitMin || ''}
                      onChange={(e) => setFormData({ ...formData, investorProfitMin: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Investor Profit Range (Max)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.investorProfitMax || ''}
                      onChange={(e) => setFormData({ ...formData, investorProfitMax: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Comparables Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Sold Comparables */}
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm">Sold Comparables</Heading>
                  <Button size="sm" onClick={() => addComparable('sold')}>Add Comparable</Button>
                </Flex>
                <VStack spacing={3} align="stretch">
                  {(formData.soldComparables || []).map((comp, index) => (
                    <Box key={comp.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="600">Comparable #{index + 1}</Text>
                        <IconButton
                          aria-label="Remove comparable"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeComparable('sold', index)}
                        />
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel>Link/Note</FormLabel>
                          <Input
                            value={comp.link || ''}
                            onChange={(e) => updateComparable('sold', index, 'link', e.target.value)}
                            placeholder="https://..."
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Price</FormLabel>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                              $
                            </InputLeftElement>
                            <Input
                              type="number"
                              value={comp.price || ''}
                              onChange={(e) => updateComparable('sold', index, 'price', parseFloat(e.target.value) || 0)}
                              pl="2.5rem"
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Pending Comparables */}
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm">Pending Comparables</Heading>
                  <Button size="sm" onClick={() => addComparable('pending')}>Add Comparable</Button>
                </Flex>
                <VStack spacing={3} align="stretch">
                  {(formData.pendingComparables || []).map((comp, index) => (
                    <Box key={comp.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="600">Comparable #{index + 1}</Text>
                        <IconButton
                          aria-label="Remove comparable"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeComparable('pending', index)}
                        />
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel>Link/Note</FormLabel>
                          <Input
                            value={comp.link || ''}
                            onChange={(e) => updateComparable('pending', index, 'link', e.target.value)}
                            placeholder="https://..."
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Price</FormLabel>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                              $
                            </InputLeftElement>
                            <Input
                              type="number"
                              value={comp.price || ''}
                              onChange={(e) => updateComparable('pending', index, 'price', parseFloat(e.target.value) || 0)}
                              pl="2.5rem"
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Cash Comparables */}
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm">Cash Comparables</Heading>
                  <Button size="sm" onClick={() => addComparable('cash')}>Add Comparable</Button>
                </Flex>
                <VStack spacing={3} align="stretch">
                  {(formData.cashComparables || []).map((comp, index) => (
                    <Box key={comp.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="600">Comparable #{index + 1}</Text>
                        <IconButton
                          aria-label="Remove comparable"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeComparable('cash', index)}
                        />
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel>Link/Note</FormLabel>
                          <Input
                            value={comp.link || ''}
                            onChange={(e) => updateComparable('cash', index, 'link', e.target.value)}
                            placeholder="https://..."
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Price</FormLabel>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                              $
                            </InputLeftElement>
                            <Input
                              type="number"
                              value={comp.price || ''}
                              onChange={(e) => updateComparable('cash', index, 'price', parseFloat(e.target.value) || 0)}
                              pl="2.5rem"
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Rentals Comparables */}
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm">Rentals Comparables</Heading>
                  <Button size="sm" onClick={() => addComparable('rentals')}>Add Comparable</Button>
                </Flex>
                <VStack spacing={3} align="stretch">
                  {(formData.rentalsComparables || []).map((comp, index) => (
                    <Box key={comp.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="600">Comparable #{index + 1}</Text>
                        <IconButton
                          aria-label="Remove comparable"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeComparable('rentals', index)}
                        />
                      </Flex>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel>Link/Note</FormLabel>
                          <Input
                            value={comp.link || ''}
                            onChange={(e) => updateComparable('rentals', index, 'link', e.target.value)}
                            placeholder="https://..."
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Price</FormLabel>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                              $
                            </InputLeftElement>
                            <Input
                              type="number"
                              value={comp.price || ''}
                              onChange={(e) => updateComparable('rentals', index, 'price', parseFloat(e.target.value) || 0)}
                              pl="2.5rem"
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* Mortgage & TC Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="sm">Mortgage Data</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Has a Mortgage</FormLabel>
                  <Select
                    value={formData.hasMortgage || ''}
                    onChange={(e) => setFormData({ ...formData, hasMortgage: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Mortgage Balance (US$)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.mortgageBalance || ''}
                      onChange={(e) => setFormData({ ...formData, mortgageBalance: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Monthly Payment Amount (US$)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.monthlyPaymentAmount || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyPaymentAmount: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Taxes and Insurance</FormLabel>
                  <Select
                    value={formData.taxesAndInsurance || ''}
                    onChange={(e) => setFormData({ ...formData, taxesAndInsurance: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="Included">Included</option>
                    <option value="Separate">Separate</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Interest Rate</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.interestRate || ''}
                      onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || undefined })}
                    />
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em" left="auto" right="0" width="2.5rem">
                      %
                    </InputLeftElement>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Years Left on Mortgage</FormLabel>
                  <Input
                    type="number"
                    value={formData.yearsLeftOnMortgage || ''}
                    onChange={(e) => setFormData({ ...formData, yearsLeftOnMortgage: parseInt(e.target.value) || undefined })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Mortgage Current</FormLabel>
                  <Select
                    value={formData.mortgageCurrent || ''}
                    onChange={(e) => setFormData({ ...formData, mortgageCurrent: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Heading size="sm">TC Section (Transaction Coordination)</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Target Close Date</FormLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.targetCloseDate)}
                    onChange={(e) => setFormData({ ...formData, targetCloseDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Inspection Period Date</FormLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.inspectionPeriodDate)}
                    onChange={(e) => setFormData({ ...formData, inspectionPeriodDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>EMD Received Date</FormLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.emdReceivedDate)}
                    onChange={(e) => setFormData({ ...formData, emdReceivedDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Next Step</FormLabel>
                  <Input
                    value={formData.nextStep || ''}
                    onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Buyer Name</FormLabel>
                  <Input
                    value={formData.buyerName || ''}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Buyer Phone Number</FormLabel>
                  <Input
                    value={formData.buyerPhoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, buyerPhoneNumber: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Buyer Email Address</FormLabel>
                  <Input
                    type="email"
                    value={formData.buyerEmailAddress || ''}
                    onChange={(e) => setFormData({ ...formData, buyerEmailAddress: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Buyer EMD Amount</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.buyerEMDAmount || ''}
                      onChange={(e) => setFormData({ ...formData, buyerEMDAmount: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>PDR EMD</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </InputLeftElement>
                    <Input
                      type="number"
                      value={formData.pdrEMD || ''}
                      onChange={(e) => setFormData({ ...formData, pdrEMD: parseFloat(e.target.value) || undefined })}
                      pl="2.5rem"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Pictures Taken By</FormLabel>
                  <Select
                    value={formData.picturesTakenBy || ''}
                    onChange={(e) => setFormData({ ...formData, picturesTakenBy: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Who is Granting Access</FormLabel>
                  <Select
                    value={formData.whoIsGrantingAccess || ''}
                    onChange={(e) => setFormData({ ...formData, whoIsGrantingAccess: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="Owner">Owner</option>
                    <option value="Agent">Agent</option>
                    <option value="Tenant">Tenant</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Lockbox Code</FormLabel>
                  <Input
                    value={formData.lockboxCode || ''}
                    onChange={(e) => setFormData({ ...formData, lockboxCode: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Title Company Assigned</FormLabel>
                  <Input
                    value={formData.titleCompanyAssigned || ''}
                    onChange={(e) => setFormData({ ...formData, titleCompanyAssigned: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Listed on MLS</FormLabel>
                  <Select
                    value={formData.listedOnMLS || ''}
                    onChange={(e) => setFormData({ ...formData, listedOnMLS: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Photos Link</FormLabel>
                  <Input
                    value={formData.photosLink || ''}
                    onChange={(e) => setFormData({ ...formData, photosLink: e.target.value })}
                    placeholder="https://..."
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Date of Signed Contract</FormLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.dateOfSignedContract)}
                    onChange={(e) => setFormData({ ...formData, dateOfSignedContract: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Date of Photos Received</FormLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(formData.dateOfPhotosReceived)}
                    onChange={(e) => setFormData({ ...formData, dateOfPhotosReceived: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Notes Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Reason for Selling</FormLabel>
                <Textarea
                  value={formData.reasonForSelling || ''}
                  onChange={(e) => setFormData({ ...formData, reasonForSelling: e.target.value })}
                  minH="100px"
                  placeholder="Enter reason for selling..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Updates Completed</FormLabel>
                <Textarea
                  value={formData.updatesCompleted || ''}
                  onChange={(e) => setFormData({ ...formData, updatesCompleted: e.target.value })}
                  minH="100px"
                  placeholder="List updates that have been completed..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Immediate Repairs Needed</FormLabel>
                <Textarea
                  value={formData.immediateRepairsNeeded || ''}
                  onChange={(e) => setFormData({ ...formData, immediateRepairsNeeded: e.target.value })}
                  minH="100px"
                  placeholder="List immediate repairs needed..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Property Notes</FormLabel>
                <Textarea
                  value={formData.propertyNotes || ''}
                  onChange={(e) => setFormData({ ...formData, propertyNotes: e.target.value })}
                  minH="150px"
                  placeholder="Additional property notes..."
                />
              </FormControl>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ModalFooter mt={6}>
        <Button variant="ghost" mr={3} onClick={onCancel} isDisabled={isLoading}>
          Cancel
        </Button>
        <Button 
          colorScheme="blue" 
          type="submit" 
          isLoading={isLoading}
        >
          Save Changes
        </Button>
      </ModalFooter>
    </form>
  );
};

export default LeadDetailPage; 