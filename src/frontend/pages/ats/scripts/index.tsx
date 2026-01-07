import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiMoreVertical, FiCopy, FiFileText } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

interface Script {
  id: string;
  name: string;
  description?: string;
  category: string;
  jobRole?: string;
  questions: any[];
  estimatedDuration?: number;
  isActive: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ScriptsListPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadScripts();
  }, [categoryFilter, page]);

  const loadScripts = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        limit,
        page,
      };

      if (categoryFilter !== 'all') {
        params.jobRole = categoryFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await atsService.listScripts(params);
      setScripts(response.scripts || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error loading scripts:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load scripts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadScripts();
  };

  const handleDelete = async (scriptId: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return;

    try {
      await atsService.deleteScript(scriptId);
      toast({
        title: 'Success',
        description: 'Script deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadScripts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete script',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClone = async (script: Script) => {
    try {
      const clonedScript = {
        ...script,
        name: `${script.name} (Copy)`,
        id: undefined,
        parentScriptId: script.id,
      };
      delete clonedScript.id;
      delete clonedScript.createdAt;
      delete clonedScript.updatedAt;

      await atsService.createScript(clonedScript);
      toast({
        title: 'Success',
        description: 'Script cloned successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadScripts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clone script',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'blue',
      sales: 'green',
      customer_service: 'purple',
      general: 'gray',
      acquisitions: 'orange',
    };
    return colors[category] || 'gray';
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg">Interview Scripts</Heading>
                <Text color="gray.600">Manage and create interview scripts for phone screenings</Text>
              </VStack>
              <Button colorScheme="blue" onClick={() => router.push('/ats/scripts/new')}>
                <FiPlus style={{ marginRight: '8px' }} />
                New Script
              </Button>
            </HStack>

            {/* Search and Filters */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4}>
                  <InputGroup flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch />
                    </InputLeftElement>
                    <Input
                      placeholder="Search scripts by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </InputGroup>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    width="200px"
                  >
                    <option value="all">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="sales">Sales</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="general">General</option>
                    <option value="acquisitions">Acquisitions</option>
                  </Select>
                  <Button colorScheme="blue" onClick={handleSearch}>
                    Search
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Scripts Table */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Text>Loading scripts...</Text>
                ) : scripts.length === 0 ? (
                  <VStack spacing={4} py={8}>
                    <FiFileText size={48} color="gray" />
                    <Text color="gray.500">No scripts found</Text>
                    <Button colorScheme="blue" onClick={() => router.push('/ats/scripts/new')}>
                      Create Your First Script
                    </Button>
                  </VStack>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Category</Th>
                        <Th>Job Role</Th>
                        <Th>Questions</Th>
                        <Th>Duration</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {scripts.map((script) => (
                        <Tr key={script.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{script.name}</Text>
                              {script.description && (
                                <Text fontSize="sm" color="gray.600">
                                  {script.description}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Tag colorScheme={getCategoryColor(script.category)}>
                              {script.category}
                            </Tag>
                          </Td>
                          <Td>{script.jobRole || '-'}</Td>
                          <Td>{script.questions?.length || 0}</Td>
                          <Td>
                            {script.estimatedDuration
                              ? `${script.estimatedDuration} min`
                              : '-'}
                          </Td>
                          <Td>
                            <Badge colorScheme={script.isActive ? 'green' : 'gray'}>
                              {script.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FiEdit />}
                                  onClick={() => router.push(`/ats/scripts/${script.id}/edit`)}
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  icon={<FiCopy />}
                                  onClick={() => handleClone(script)}
                                >
                                  Clone
                                </MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  onClick={() => handleDelete(script.id)}
                                  color="red.500"
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default ScriptsListPage;

