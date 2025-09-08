import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Flex,
  Icon,
  useToast,
  SimpleGrid,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Spinner,
  Avatar,
  InputGroup,
  InputRightElement,
  IconButton,
  Image,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiFileText,
  FiEdit,
  FiSave,
  FiX,
  FiUpload,
  FiDownload,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiThumbsUp,
  FiTrash2,
  FiPaperclip,
  FiImage,
  FiSend,
} from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { transactionsService, TransactionProperty } from '../../services/transactionsService';

const TransactionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transaction, setTransaction] = useState<TransactionProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TransactionProperty>>({});
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Seller info modal state
  const { isOpen: isSellerModalOpen, onOpen: onSellerModalOpen, onClose: onSellerModalClose } = useDisclosure();
  const [sellerForm, setSellerForm] = useState({
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    seller2Name: '',
    seller2Phone: '',
    seller2Email: '',
    acquisitionsAgent: '',
    acquisitionsAgentEmail: '',
    acquisitionsAgentPhone: '',
  });

  // Buyer info modal state
  const { isOpen: isBuyerModalOpen, onOpen: onBuyerModalOpen, onClose: onBuyerModalClose } = useDisclosure();
  const [buyerForm, setBuyerForm] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    dispositionsAgent: '',
    dispositionsAgentEmail: '',
    dispositionsAgentPhone: '',
  });

  // Lender info modal state
  const { isOpen: isLenderModalOpen, onOpen: onLenderModalOpen, onClose: onLenderModalClose } = useDisclosure();
  const [lenderForm, setLenderForm] = useState({
    lenderName: '',
    lenderEmail: '',
    lenderOffice: '',
    lenderPhone: '',
    lenderType: '',
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadTransaction(id);
    }
  }, [id]);

  const loadTransaction = async (transactionId: string) => {
    setLoading(true);
    try {
      const data = await transactionsService.get(transactionId);
      if (data) {
        setTransaction(data);
        setEditForm(data);
      } else {
        toast({
          title: 'Transaction not found',
          status: 'error',
          duration: 3000,
        });
        router.push('/transactions');
      }
    } catch (error) {
      toast({
        title: 'Error loading transaction',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TransactionProperty['status']) => {
    if (!transaction) return;
    
    try {
      const updated = await transactionsService.update(transaction.id, { status: newStatus });
      if (updated) {
        setTransaction(updated);
        setEditForm(updated);
        toast({
          title: 'Status updated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    if (!transaction) return;
    
    try {
      const updated = await transactionsService.update(transaction.id, editForm);
      if (updated) {
        setTransaction(updated);
        setIsEditing(false);
        toast({
          title: 'Transaction updated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating transaction',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setEditForm(transaction || {});
    setIsEditing(false);
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !transaction) return;
    
    try {
      const updated = await transactionsService.addActivity(transaction.id, {
        user: 'Current User',
        userEmail: 'user@example.com',
        message: newMessage,
      });
      if (updated) {
        setTransaction(updated);
        setNewMessage('');
        toast({
          title: 'Message added',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error adding message',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !transaction) return;

    setUploading(true);
    try {
      const updated = await transactionsService.uploadDocument(transaction.id, file);
      if (updated) {
        setTransaction(updated);
        toast({
          title: 'Document uploaded successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error uploading document',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (document: any) => {
    // For now, we'll open the document URL in a new tab
    // In a real implementation, you might want to use a document viewer modal
    if (document.url) {
      // If it's a full URL, open it directly
      if (document.url.startsWith('http')) {
        window.open(document.url, '_blank');
      } else {
        // If it's a relative path, construct the full URL
        // Static files are served at /uploads/ not /api/v1/uploads/
        const baseUrl = process.env.NEXT_PUBLIC_TRANSACTIONS_API_URL?.replace('/api/v1', '') || 'http://localhost:3003';
        const fullUrl = `${baseUrl}${document.url}`;
        window.open(fullUrl, '_blank');
      }
    } else {
      toast({
        title: 'Document URL not available',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleDownloadDocument = (document: any) => {
    if (document.url) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      if (document.url.startsWith('http')) {
        link.href = document.url;
      } else {
        // Static files are served at /uploads/ not /api/v1/uploads/
        const baseUrl = process.env.NEXT_PUBLIC_TRANSACTIONS_API_URL?.replace('/api/v1', '') || 'http://localhost:3003';
        link.href = `${baseUrl}${document.url}`;
      }
      link.download = document.name || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: 'Document URL not available',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleOpenSellerModal = () => {
    if (transaction) {
      setSellerForm({
        sellerName: transaction.sellerName || '',
        sellerPhone: transaction.sellerPhone || '',
        sellerEmail: transaction.sellerEmail || '',
        seller2Name: transaction.seller2Name || '',
        seller2Phone: transaction.seller2Phone || '',
        seller2Email: transaction.seller2Email || '',
        acquisitionsAgent: transaction.acquisitionsAgent || '',
        acquisitionsAgentEmail: transaction.acquisitionsAgentEmail || '',
        acquisitionsAgentPhone: transaction.acquisitionsAgentPhone || '',
      });
    }
    onSellerModalOpen();
  };

  const handleSellerFormChange = (field: string, value: string) => {
    setSellerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSellerInfo = async () => {
    if (!transaction) return;

    try {
      const updated = await transactionsService.update(transaction.id, sellerForm);
      if (updated) {
        setTransaction(updated);
        setEditForm(updated);
        onSellerModalClose();
        toast({
          title: 'Seller information updated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating seller information',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleOpenBuyerModal = () => {
    if (transaction) {
      setBuyerForm({
        buyerName: transaction.buyerName || '',
        buyerPhone: transaction.buyerPhone || '',
        buyerEmail: transaction.buyerEmail || '',
        dispositionsAgent: transaction.dispositionsAgent || '',
        dispositionsAgentEmail: transaction.dispositionsAgentEmail || '',
        dispositionsAgentPhone: transaction.dispositionsAgentPhone || '',
      });
    }
    onBuyerModalOpen();
  };

  const handleBuyerFormChange = (field: string, value: string) => {
    setBuyerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveBuyerInfo = async () => {
    if (!transaction) return;

    try {
      const updated = await transactionsService.update(transaction.id, buyerForm);
      if (updated) {
        setTransaction(updated);
        setEditForm(updated);
        onBuyerModalClose();
        toast({
          title: 'Buyer information updated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating buyer information',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleOpenLenderModal = () => {
    if (transaction) {
      setLenderForm({
        lenderName: transaction.lenderName || '',
        lenderEmail: transaction.lenderEmail || '',
        lenderOffice: transaction.lenderOffice || '',
        lenderPhone: transaction.lenderPhone || '',
        lenderType: transaction.lenderType || '',
      });
    }
    onLenderModalOpen();
  };

  const handleLenderFormChange = (field: string, value: string) => {
    setLenderForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveLenderInfo = async () => {
    if (!transaction) return;

    try {
      const updated = await transactionsService.update(transaction.id, lenderForm);
      if (updated) {
        setTransaction(updated);
        setEditForm(updated);
        onLenderModalClose();
        toast({
          title: 'Lender information updated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating lender information',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: TransactionProperty['status']) => {
    switch (status) {
      case 'gathering_docs': return 'red';
      case 'holding_for_funding': return 'green';
      case 'gathering_title': return 'blue';
      case 'client_help_needed': return 'gray';
      case 'on_hold': return 'blue';
      case 'pending_closing': return 'yellow';
      case 'ready_to_close': return 'purple';
      case 'closed': return 'pink';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: TransactionProperty['status']) => {
    switch (status) {
      case 'gathering_docs': return 'Gathering Documents';
      case 'holding_for_funding': return 'Holding for Funding';
      case 'gathering_title': return 'Gathering Title';
      case 'client_help_needed': return 'Client Help Needed';
      case 'on_hold': return 'On Hold';
      case 'pending_closing': return 'Pending Closing';
      case 'ready_to_close': return 'Ready to Close';
      case 'closed': return 'Closed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Flex align="center" justify="center" minH="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Loading transaction details...</Text>
              </VStack>
            </Flex>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Alert status="error">
              <AlertIcon />
              Transaction not found
            </Alert>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Button
                  leftIcon={<Icon as={FiArrowLeft} />}
                  variant="ghost"
                  onClick={() => router.push('/transactions/board')}
                >
                  Back to Board
                </Button>
                <VStack align="start" spacing={1}>
                  <Heading size="lg">{transaction.id.toUpperCase()}</Heading>
                  <Text color="gray.600">{transaction.address}</Text>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                {!isEditing ? (
                  <Button
                    leftIcon={<Icon as={FiEdit} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      leftIcon={<Icon as={FiX} />}
                      variant="ghost"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiSave} />}
                      colorScheme="blue"
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </>
                )}
              </HStack>
            </HStack>

            {/* Status Badge */}
            <Card>
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">Current Status</Text>
                    <Badge
                      colorScheme={getStatusColor(transaction.status)}
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </VStack>
                  <VStack align="end" spacing={2}>
                    <Text fontSize="sm" color="gray.600">Contract Date</Text>
                    <Text fontWeight="semibold">{formatDate(transaction.contractDate)}</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Main Content Tabs */}
            <Tabs>
              <TabList>
                <Tab>Details</Tab>
                <Tab>Seller Info</Tab>
                <Tab>Buyer Info</Tab>
                <Tab>Title & Lender</Tab>
                <Tab>Documents</Tab>
                <Tab>Activity ({transaction.activities?.length || 0}+)</Tab>
              </TabList>

              <TabPanels>
                {/* Details Tab */}
                <TabPanel p={0} pt={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Property Details */}
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Property Details</Heading>
                        <VStack align="stretch" spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Address</FormLabel>
                            {isEditing ? (
                              <Input
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                              />
                            ) : (
                              <Text fontWeight="medium">{transaction.address}</Text>
                            )}
                          </FormControl>
                          
                          <SimpleGrid columns={2} spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">City</FormLabel>
                              {isEditing ? (
                                <Input
                                  value={editForm.city || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                />
                              ) : (
                                <Text fontWeight="medium">{transaction.city}</Text>
                              )}
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" color="gray.600">State</FormLabel>
                              {isEditing ? (
                                <Input
                                  value={editForm.state || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                                />
                              ) : (
                                <Text fontWeight="medium">{transaction.state}</Text>
                              )}
                            </FormControl>
                          </SimpleGrid>

                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Zip Code</FormLabel>
                            {isEditing ? (
                              <Input
                                value={editForm.zip || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, zip: e.target.value }))}
                              />
                            ) : (
                              <Text fontWeight="medium">{transaction.zip || 'N/A'}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Property Type</FormLabel>
                            {isEditing ? (
                              <Select
                                value={editForm.propertyType || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, propertyType: e.target.value }))}
                              >
                                <option value="single_family">Single Family</option>
                                <option value="multi_family">Multi Family</option>
                                <option value="condo">Condo</option>
                                <option value="land">Land</option>
                              </Select>
                            ) : (
                              <Text fontWeight="medium">{transaction.propertyType || 'N/A'}</Text>
                            )}
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Transaction Details */}
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Transaction Details</Heading>
                        <VStack align="stretch" spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Transaction Type</FormLabel>
                            {isEditing ? (
                              <Select
                                value={editForm.transactionType || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, transactionType: e.target.value }))}
                              >
                                <option value="assignment">Assignment</option>
                                <option value="double_close">Double Close</option>
                                <option value="wholetail">Wholetail</option>
                              </Select>
                            ) : (
                              <Text fontWeight="medium">{transaction.transactionType || 'N/A'}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Loan Type</FormLabel>
                            {isEditing ? (
                              <Select
                                value={editForm.loanType || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, loanType: e.target.value }))}
                              >
                                <option value="conventional">Conventional</option>
                                <option value="fha">FHA</option>
                                <option value="va">VA</option>
                                <option value="other">Other</option>
                              </Select>
                            ) : (
                              <Text fontWeight="medium">{transaction.loanType || 'N/A'}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Client Account</FormLabel>
                            {isEditing ? (
                              <Input
                                value={editForm.clientAccount || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, clientAccount: e.target.value }))}
                              />
                            ) : (
                              <Text fontWeight="medium">{transaction.clientAccount || 'N/A'}</Text>
                            )}
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Coordinator</FormLabel>
                            {isEditing ? (
                              <Input
                                value={editForm.coordinatorName || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, coordinatorName: e.target.value }))}
                              />
                            ) : (
                              <Text fontWeight="medium">{transaction.coordinatorName || 'Unassigned'}</Text>
                            )}
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Status Management */}
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Status Management</Heading>
                        <VStack align="stretch" spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" color="gray.600">Update Status</FormLabel>
                            <Select
                              value={transaction.status}
                              onChange={(e) => handleStatusUpdate(e.target.value as TransactionProperty['status'])}
                            >
                              <option value="gathering_docs">Gathering Documents</option>
                              <option value="holding_for_funding">Holding for Funding</option>
                              <option value="gathering_title">Gathering Title</option>
                              <option value="client_help_needed">Client Help Needed</option>
                              <option value="on_hold">On Hold</option>
                              <option value="pending_closing">Pending Closing</option>
                              <option value="ready_to_close">Ready to Close</option>
                              <option value="closed">Closed</option>
                              <option value="cancelled">Cancelled</option>
                            </Select>
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Notes */}
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Notes</Heading>
                        <FormControl>
                          <FormLabel fontSize="sm" color="gray.600">Transaction Notes</FormLabel>
                          {isEditing ? (
                            <Textarea
                              value={editForm.notes || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Add notes about this transaction..."
                              rows={6}
                            />
                          ) : (
                            <Box p={4} bg="gray.50" borderRadius="md" minH="150px">
                              <Text>{transaction.notes || 'No notes added yet'}</Text>
                            </Box>
                          )}
                        </FormControl>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Seller Info Tab */}
                <TabPanel p={0} pt={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card>
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <Heading size="md">Seller Info</Heading>
                          <Button colorScheme="red" size="sm" onClick={handleOpenSellerModal}>
                            Update Seller Info
                          </Button>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Seller's Name</Text>
                            <Text>{transaction.sellerName || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Seller Phone</Text>
                            <Text>{transaction.sellerPhone || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Seller Email</Text>
                            <Text>{transaction.sellerEmail || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Seller 2 Name</Text>
                            <Text>{transaction.seller2Name || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Seller 2 Phone</Text>
                            <Text>{transaction.seller2Phone || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Seller 2 Email</Text>
                            <Text>{transaction.seller2Email || '-'}</Text>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Agent Details</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Acquisitions Agent</Text>
                            <Text>{transaction.acquisitionsAgent || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Acquisitions Agent Email</Text>
                            <Text>{transaction.acquisitionsAgentEmail || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Acquisitions Agent Phone</Text>
                            <Text>{transaction.acquisitionsAgentPhone || '-'}</Text>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Buyer Info Tab */}
                <TabPanel p={0} pt={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card>
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <Heading size="md">Buyer Info</Heading>
                          <Button colorScheme="red" size="sm" onClick={handleOpenBuyerModal}>
                            Update Buyer Info
                          </Button>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Buyer Name</Text>
                            <Text>{transaction.buyerName || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Buyer Email</Text>
                            <Text>{transaction.buyerEmail || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Buyer Phone</Text>
                            <Text>{transaction.buyerPhone || '-'}</Text>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Agent Details</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Dispositions Agent</Text>
                            <Text>{transaction.dispositionsAgent || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Dispositions Agent Email</Text>
                            <Text>{transaction.dispositionsAgentEmail || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Dispositions Agent Phone</Text>
                            <Text>{transaction.dispositionsAgentPhone || '-'}</Text>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Title & Lender Tab */}
                <TabPanel p={0} pt={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card>
                      <CardBody>
                        <Heading size="md" mb={4}>Title Details</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Title Name</Text>
                            <Text>{transaction.titleName || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Title Phone</Text>
                            <Text>{transaction.titlePhone || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Title Email</Text>
                            <Text>{transaction.titleEmail || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Title Office Address</Text>
                            <Text>{transaction.titleOfficeAddress || '-'}</Text>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <Heading size="md">Lender Details</Heading>
                          <Button colorScheme="red" size="sm" onClick={handleOpenLenderModal}>
                            Update Lender
                          </Button>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Lender Name</Text>
                            <Text>{transaction.lenderName || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Lender Email</Text>
                            <Text>{transaction.lenderEmail || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Lender Type</Text>
                            <Text>{transaction.lenderType || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Lender Office</Text>
                            <Text>{transaction.lenderOffice || '-'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">Lender Phone</Text>
                            <Text>{transaction.lenderPhone || '-'}</Text>
                          </Box>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Documents Tab */}
                <TabPanel p={0} pt={6}>
                  <VStack align="stretch" spacing={6}>
                    <HStack justify="space-between">
                      <Heading size="md">Documents</Heading>
                      <HStack spacing={3}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <Button
                          leftIcon={<Icon as={FiUpload} />}
                          colorScheme="blue"
                          onClick={() => fileInputRef.current?.click()}
                          isLoading={uploading}
                        >
                          Upload Document
                        </Button>
                      </HStack>
                    </HStack>

                    <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                      {transaction.documents && transaction.documents.length > 0 ? (
                        transaction.documents.map((doc) => (
                          <Card key={doc.id} size="sm" cursor="pointer" _hover={{ shadow: 'md' }}>
                            <CardBody p={3} textAlign="center">
                              <VStack spacing={2}>
                                <Icon as={FiFileText} boxSize={8} color="blue.500" />
                                <Text fontSize="xs" fontWeight="medium" noOfLines={2}>
                                  {doc.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(doc.uploadedAt)}
                                </Text>
                                <HStack spacing={1}>
                                  <Button 
                                    size="xs" 
                                    leftIcon={<Icon as={FiEye} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDocument(doc);
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    size="xs" 
                                    leftIcon={<Icon as={FiDownload} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadDocument(doc);
                                    }}
                                  >
                                    Download
                                  </Button>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <Box
                          colSpan={6}
                          textAlign="center"
                          py={8}
                          border="2px dashed"
                          borderColor="gray.200"
                          borderRadius="md"
                        >
                          <Icon as={FiFileText} boxSize={12} color="gray.300" mb={4} />
                          <Text color="gray.500">No documents uploaded yet</Text>
                          <Text fontSize="sm" color="gray.400">Click "Upload Document" to add files</Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Activity Tab */}
                <TabPanel p={0} pt={6}>
                  <VStack align="stretch" spacing={6}>
                    {/* Message Input */}
                    <Card>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <VStack align="stretch" spacing={3}>
                            <Input
                              placeholder="Enter a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
                              size="md"
                            />
                            <HStack justify="space-between" w="full">
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="Attach file"
                                  icon={<Icon as={FiPaperclip} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                />
                                <IconButton
                                  aria-label="Add image"
                                  icon={<Icon as={FiImage} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                />
                              </HStack>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<Icon as={FiSend} />}
                                onClick={handleAddMessage}
                                isDisabled={!newMessage.trim()}
                                minW="80px"
                              >
                                Post
                              </Button>
                            </HStack>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Activity Feed */}
                    <VStack align="stretch" spacing={4}>
                      {transaction.activities && transaction.activities.length > 0 ? (
                        transaction.activities.map((activity) => (
                          <Card key={activity.id}>
                            <CardBody>
                              <HStack align="start" spacing={4}>
                                <Avatar size="sm" name={activity.user}>
                                  {getInitials(activity.user)}
                                </Avatar>
                                <VStack align="start" spacing={2} flex={1}>
                                  <HStack spacing={2}>
                                    <Text fontWeight="medium" fontSize="sm">
                                      {activity.userEmail}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {formatTimeAgo(activity.timestamp)}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="sm">{activity.message}</Text>
                                  <HStack spacing={4}>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      leftIcon={<Icon as={FiThumbsUp} />}
                                    >
                                      {activity.likes}
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      leftIcon={<Icon as={FiTrash2} />}
                                      colorScheme="red"
                                    >
                                      Delete
                                    </Button>
                                  </HStack>
                                </VStack>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardBody textAlign="center" py={8}>
                            <Text color="gray.500">No activity yet</Text>
                            <Text fontSize="sm" color="gray.400">Start a conversation about this transaction</Text>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>
      </HStack>

      {/* Seller Info Edit Modal */}
      <Modal isOpen={isSellerModalOpen} onClose={onSellerModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Update Seller Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Primary Seller */}
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>Primary Seller</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Seller Name</FormLabel>
                      <Input
                        value={sellerForm.sellerName}
                        onChange={(e) => handleSellerFormChange('sellerName', e.target.value)}
                        placeholder="Enter seller name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={sellerForm.sellerPhone}
                        onChange={(e) => handleSellerFormChange('sellerPhone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={sellerForm.sellerEmail}
                        onChange={(e) => handleSellerFormChange('sellerEmail', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Secondary Seller */}
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>Secondary Seller (Optional)</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Seller 2 Name</FormLabel>
                      <Input
                        value={sellerForm.seller2Name}
                        onChange={(e) => handleSellerFormChange('seller2Name', e.target.value)}
                        placeholder="Enter second seller name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={sellerForm.seller2Phone}
                        onChange={(e) => handleSellerFormChange('seller2Phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={sellerForm.seller2Email}
                        onChange={(e) => handleSellerFormChange('seller2Email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Acquisitions Agent */}
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>Acquisitions Agent</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Agent Name</FormLabel>
                      <Input
                        value={sellerForm.acquisitionsAgent}
                        onChange={(e) => handleSellerFormChange('acquisitionsAgent', e.target.value)}
                        placeholder="Enter agent name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={sellerForm.acquisitionsAgentEmail}
                        onChange={(e) => handleSellerFormChange('acquisitionsAgentEmail', e.target.value)}
                        placeholder="Enter agent email"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={sellerForm.acquisitionsAgentPhone}
                        onChange={(e) => handleSellerFormChange('acquisitionsAgentPhone', e.target.value)}
                        placeholder="Enter agent phone"
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSellerModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleSaveSellerInfo}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Buyer Info Edit Modal */}
      <Modal isOpen={isBuyerModalOpen} onClose={onBuyerModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Update Buyer Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Buyer Information */}
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>Buyer Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Buyer Name</FormLabel>
                      <Input
                        value={buyerForm.buyerName}
                        onChange={(e) => handleBuyerFormChange('buyerName', e.target.value)}
                        placeholder="Enter buyer name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={buyerForm.buyerPhone}
                        onChange={(e) => handleBuyerFormChange('buyerPhone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={buyerForm.buyerEmail}
                        onChange={(e) => handleBuyerFormChange('buyerEmail', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Dispositions Agent */}
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>Dispositions Agent</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Agent Name</FormLabel>
                      <Input
                        value={buyerForm.dispositionsAgent}
                        onChange={(e) => handleBuyerFormChange('dispositionsAgent', e.target.value)}
                        placeholder="Enter agent name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={buyerForm.dispositionsAgentEmail}
                        onChange={(e) => handleBuyerFormChange('dispositionsAgentEmail', e.target.value)}
                        placeholder="Enter agent email"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={buyerForm.dispositionsAgentPhone}
                        onChange={(e) => handleBuyerFormChange('dispositionsAgentPhone', e.target.value)}
                        placeholder="Enter agent phone"
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBuyerModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleSaveBuyerInfo}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lender Info Edit Modal */}
      <Modal isOpen={isLenderModalOpen} onClose={onLenderModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Update Lender Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Lender Information */}
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>Lender Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Lender Name</FormLabel>
                      <Input
                        value={lenderForm.lenderName}
                        onChange={(e) => handleLenderFormChange('lenderName', e.target.value)}
                        placeholder="Enter lender name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={lenderForm.lenderEmail}
                        onChange={(e) => handleLenderFormChange('lenderEmail', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={lenderForm.lenderPhone}
                        onChange={(e) => handleLenderFormChange('lenderPhone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Office</FormLabel>
                      <Input
                        value={lenderForm.lenderOffice}
                        onChange={(e) => handleLenderFormChange('lenderOffice', e.target.value)}
                        placeholder="Enter office location"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Lender Type</FormLabel>
                      <Select
                        value={lenderForm.lenderType}
                        onChange={(e) => handleLenderFormChange('lenderType', e.target.value)}
                        placeholder="Select lender type"
                      >
                        <option value="conventional">Conventional</option>
                        <option value="fha">FHA</option>
                        <option value="va">VA</option>
                        <option value="usda">USDA</option>
                        <option value="hard_money">Hard Money</option>
                        <option value="private">Private</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLenderModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleSaveLenderInfo}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TransactionDetailPage;