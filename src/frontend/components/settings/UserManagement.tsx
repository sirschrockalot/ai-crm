import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormErrorMessage,
  Textarea,
  SimpleGrid,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  AvatarGroup,
  Checkbox,
  CheckboxGroup,
  InputGroup,
  InputRightElement,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { FiUsers, FiShield, FiHome, FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiChevronDown, FiUserPlus, FiKey } from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  lastLogin?: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface OrganizationalUnit {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  userCount: number;
  children: OrganizationalUnit[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper normalizers to ensure stable keys
  const normalizeUser = (u: any): User => ({
    id: (u && (u.id || u._id || u.email)) || String(Math.random()),
    firstName: u?.firstName ?? '',
    lastName: u?.lastName ?? '',
    email: u?.email ?? '',
    role: Array.isArray(u?.roles) && u.roles.length > 0 ? u.roles[0] : (u?.role ?? ''),
    department: u?.department ?? '',
    isActive: typeof u?.isActive === 'boolean' ? u.isActive : true,
    lastLogin: u?.lastLogin ?? undefined,
    avatar: u?.avatar ?? undefined,
  });
  
  // User modal
  const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    organizationalUnit: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string>('');
  
  // Role modal
  const { isOpen: isRoleOpen, onOpen: onRoleOpen, onClose: onRoleClose } = useDisclosure();
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string>('');
  
  // Organizational unit modal
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  const [unitForm, setUnitForm] = useState({
    name: '',
    description: '',
    parentId: '',
  });
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string>('');
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData, permissionsData, unitsData] = await Promise.all([
        settingsService.getUsers(),
        settingsService.getRoles(),
        // Mock permissions data - replace with actual API call
        Promise.resolve([
          { id: '1', name: 'user:read', description: 'Read user information', category: 'User Management' },
          { id: '2', name: 'user:write', description: 'Create and modify users', category: 'User Management' },
          { id: '3', name: 'user:delete', description: 'Delete users', category: 'User Management' },
          { id: '4', name: 'role:read', description: 'Read role information', category: 'Role Management' },
          { id: '5', name: 'role:write', description: 'Create and modify roles', category: 'Role Management' },
          { id: '6', name: 'role:delete', description: 'Delete roles', category: 'Role Management' },
          { id: '7', name: 'settings:read', description: 'Read system settings', category: 'System Settings' },
          { id: '8', name: 'settings:write', description: 'Modify system settings', category: 'System Settings' },
        ]),
        // Mock organizational units data - replace with actual API call
        Promise.resolve([
          {
            id: '1',
            name: 'Executive',
            description: 'Executive leadership team',
            userCount: 3,
            children: [],
          },
          {
            id: '2',
            name: 'Sales',
            description: 'Sales and business development',
            userCount: 12,
            children: [
              {
                id: '2.1',
                name: 'Inside Sales',
                description: 'Inside sales team',
                parentId: '2',
                userCount: 6,
                children: [],
              },
              {
                id: '2.2',
                name: 'Field Sales',
                description: 'Field sales representatives',
                parentId: '2',
                userCount: 6,
                children: [],
              },
            ],
          },
          {
            id: '3',
            name: 'Operations',
            description: 'Operations and support',
            userCount: 8,
            children: [],
          },
        ]),
      ]);
      
      // Normalize users (ensure stable unique keys)
      const normalizedUsers = Array.isArray(usersData) ? usersData.map(normalizeUser) : [];
      setUsers(normalizedUsers as any);

      // Normalize roles coming from the service (may use _id instead of id)
      const normalizedRoles = (rolesData as any[]).map((r) => ({
        id: (r && (r.id || r._id)) || String(Math.random()),
        name: r?.name ?? '',
        description: r?.description ?? '',
        permissions: r?.permissions ?? [],
        userCount: r?.userCount ?? 0,
        isSystem: r?.isSystem ?? false,
      }));
      setRoles(normalizedRoles);
      setPermissions(permissionsData);
      setOrganizationalUnits(unitsData);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to load user management data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSave = async () => {
    try {
      // Minimal validation and debug logging to ensure the action fires
      if (!userForm.firstName || !userForm.lastName || !userForm.email) {
        toast({
          title: 'Missing information',
          description: 'First name, last name, and email are required',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
        return;
      }
      console.log('UserManagement: handleUserSave clicked', { isEditing, editingUserId, userForm });

      if (isEditing) {
        const updatedUser = await settingsService.updateUser(editingUserId, userForm);
        setUsers(prev => prev.map(u => u.id === editingUserId ? updatedUser : u));
        toast({
          title: 'User updated',
          description: 'User has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newUser = await settingsService.createUser(userForm);
        setUsers(prev => [...prev, newUser]);
        toast({
          title: 'User created',
          description: 'User has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onUserClose();
      resetUserForm();
    } catch (error) {
      console.error('UserManagement: handleUserSave error', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRoleSave = async () => {
    try {
      if (isEditingRole) {
        const updatedRole = await settingsService.updateRole(editingRoleId, roleForm);
        setRoles(prev => prev.map(r => r.id === editingRoleId ? updatedRole : r));
        toast({
          title: 'Role updated',
          description: 'Role has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newRole = await settingsService.createRole(roleForm);
        setRoles(prev => [...prev, newRole]);
        toast({
          title: 'Role created',
          description: 'Role has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onRoleClose();
      resetRoleForm();
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save role',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUnitSave = async () => {
    try {
      // Mock implementation - replace with actual API call
      if (isEditingUnit) {
        const updatedUnits = organizationalUnits.map(unit => 
          unit.id === editingUnitId 
            ? { ...unit, ...unitForm }
            : unit
        );
        setOrganizationalUnits(updatedUnits);
        toast({
          title: 'Unit updated',
          description: 'Organizational unit has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newUnit: OrganizationalUnit = {
          id: Date.now().toString(),
          ...unitForm,
          userCount: 0,
          children: [],
        };
        setOrganizationalUnits(prev => [...prev, newUnit]);
        toast({
          title: 'Unit created',
          description: 'Organizational unit has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onUnitClose();
      resetUnitForm();
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save organizational unit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const editUser = (user: User) => {
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      organizationalUnit: '',
    });
    setIsEditing(true);
    setEditingUserId(user.id);
    onUserOpen();
  };

  const editRole = (role: Role) => {
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsEditingRole(true);
    setEditingRoleId(role.id);
    onRoleOpen();
  };

  const editUnit = (unit: OrganizationalUnit) => {
    setUnitForm({
      name: unit.name,
      description: unit.description,
      parentId: unit.parentId || '',
    });
    setIsEditingUnit(true);
    setEditingUnitId(unit.id);
    onUnitOpen();
  };

  const deleteUser = async (userId: string) => {
    try {
      await settingsService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      await settingsService.deleteRole(roleId);
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast({
        title: 'Role deleted',
        description: 'Role has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete role',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      department: '',
      organizationalUnit: '',
    });
    setIsEditing(false);
    setEditingUserId('');
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
    });
    setIsEditingRole(false);
    setEditingRoleId('');
  };

  const resetUnitForm = () => {
    setUnitForm({
      name: '',
      description: '',
      parentId: '',
    });
    setIsEditingUnit(false);
    setEditingUnitId('');
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Text>Loading user management data...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color={textColor}>
        User Management
      </Heading>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Users</Tab>
          <Tab>Roles & Permissions</Tab>
          <Tab>Organizational Structure</Tab>
        </TabList>

        <TabPanels>
          {/* Users Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <InputGroup maxW="400px">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputRightElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputRightElement>
                </InputGroup>
                <Button colorScheme="blue" onClick={onUserOpen} leftIcon={<FiUserPlus />}>
                  Add User
                </Button>
              </HStack>

              <Card>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Role</Th>
                        <Th>Department</Th>
                        <Th>Status</Th>
                        <Th>Last Login</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUsers.map((user) => (
                        <Tr key={user.id}>
                          <Td>
                            <HStack>
                              <Avatar size="sm" name={`${user.firstName} ${user.lastName}`} src={user.avatar} />
                              <Box>
                                <Text fontWeight="medium">{`${user.firstName} ${user.lastName}`}</Text>
                                <Text fontSize="sm" color="gray.500">{user.email}</Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue">{user.role}</Badge>
                          </Td>
                          <Td>{user.department}</Td>
                          <Td>
                            <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="Edit user">
                                <IconButton
                                  aria-label="Edit user"
                                  icon={<FiEdit2 />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => editUser(user)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete user">
                                <IconButton
                                  aria-label="Delete user"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => deleteUser(user.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Roles & Permissions Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Roles & Permissions</Heading>
                <Button colorScheme="blue" onClick={onRoleOpen} leftIcon={<FiPlus />}>
                  Add Role
                </Button>
              </HStack>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Roles */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Roles</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {roles.map((role) => (
                        <Box
                          key={role.id}
                          p={3}
                          border="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                        >
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="medium">{role.name}</Text>
                              <Text fontSize="sm" color="gray.500">{role.description}</Text>
                              <Text fontSize="xs" color="gray.400">
                                {role.userCount} users • {role.permissions.length} permissions
                              </Text>
                            </Box>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit role"
                                icon={<FiEdit2 />}
                                size="sm"
                                variant="ghost"
                                onClick={() => editRole(role)}
                              />
                              {!role.isSystem && (
                                <IconButton
                                  aria-label="Delete role"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => deleteRole(role.id)}
                                />
                              )}
                            </HStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Permissions */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Available Permissions</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <Box key={category}>
                          <Text fontWeight="medium" mb={2}>{category}</Text>
                          <VStack spacing={2} align="stretch">
                            {perms.map((permission) => (
                              <Box
                                key={permission.id}
                                p={2}
                                bg="gray.50"
                                borderRadius="md"
                                fontSize="sm"
                              >
                                <Text fontWeight="medium">{permission.name}</Text>
                                <Text color="gray.600">{permission.description}</Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Organizational Structure Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Organizational Structure</Heading>
                <Button colorScheme="blue" onClick={onUnitOpen} leftIcon={<FiPlus />}>
                  Add Unit
                </Button>
              </HStack>

              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {organizationalUnits.map((unit) => (
                      <Box
                        key={unit.id}
                        p={4}
                        border="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                      >
                        <HStack justify="space-between">
                          <Box>
                            <HStack>
                              <Icon as={FiHome} color="blue.500" />
                              <Text fontWeight="medium">{unit.name}</Text>
                              <Badge colorScheme="blue">{unit.userCount} users</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500" mt={1}>
                              {unit.description}
                            </Text>
                          </Box>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit unit"
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              onClick={() => editUnit(unit)}
                            />
                            <IconButton
                              aria-label="Delete unit"
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                            />
                          </HStack>
                        </HStack>
                        
                        {unit.children.length > 0 && (
                          <Box mt={3} ml={6}>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>Sub-units:</Text>
                            <VStack spacing={2} align="stretch">
                              {unit.children.map((child) => (
                                <Box
                                  key={child.id}
                                  p={2}
                                  bg="gray.50"
                                  borderRadius="md"
                                  borderLeft="3px solid"
                                  borderColor="blue.200"
                                >
                                  <HStack justify="space-between">
                                    <Box>
                                      <Text fontWeight="medium">{child.name}</Text>
                                      <Text fontSize="sm" color="gray.500">{child.description}</Text>
                                      <Text fontSize="xs" color="gray.400">{child.userCount} users</Text>
                                    </Box>
                                    <HStack spacing={2}>
                                      <IconButton
                                        aria-label="Edit sub-unit"
                                        icon={<FiEdit2 />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => editUnit(child)}
                                      />
                                      <IconButton
                                        aria-label="Delete sub-unit"
                                        icon={<FiTrash2 />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                      />
                                    </HStack>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* User Modal */}
      <Modal isOpen={isUserOpen} onClose={onUserClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit User' : 'Add User'}</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={userForm.firstName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={userForm.lastName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  type="email"
                />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Select role"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={userForm.department}
                    onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Organizational Unit</FormLabel>
                <Select
                  value={userForm.organizationalUnit}
                  onChange={(e) => setUserForm(prev => ({ ...prev, organizationalUnit: e.target.value }))}
                  placeholder="Select organizational unit"
                >
                  {organizationalUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUserClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUserSave}>
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Role Modal */}
      <Modal isOpen={isRoleOpen} onClose={onRoleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditingRole ? 'Edit Role' : 'Add Role'}</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Role Name</FormLabel>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Permissions</FormLabel>
                <Box maxH="300px" overflow="auto">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <Box key={category} mb={4}>
                      <Text fontWeight="medium" mb={2}>{category}</Text>
                      <CheckboxGroup value={roleForm.permissions} onChange={(values) => setRoleForm(prev => ({ ...prev, permissions: values as string[] }))}>
                        <VStack spacing={2} align="start">
                          {perms.map((permission) => (
                            <Checkbox key={permission.id} value={permission.id}>
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">{permission.name}</Text>
                                <Text fontSize="xs" color="gray.500">{permission.description}</Text>
                              </Box>
                            </Checkbox>
                          ))}
                        </VStack>
                      </CheckboxGroup>
                    </Box>
                  ))}
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRoleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleRoleSave}>
              {isEditingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Organizational Unit Modal */}
      <Modal isOpen={isUnitOpen} onClose={onUnitClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditingUnit ? 'Edit Unit' : 'Add Unit'}</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Unit Name</FormLabel>
                <Input
                  value={unitForm.name}
                  onChange={(e) => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter unit name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={unitForm.description}
                  onChange={(e) => setUnitForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter unit description"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Parent Unit (Optional)</FormLabel>
                <Select
                  value={unitForm.parentId}
                  onChange={(e) => setUnitForm(prev => ({ ...prev, parentId: e.target.value }))}
                  placeholder="Select parent unit"
                >
                  {organizationalUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUnitClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUnitSave}>
              {isEditingUnit ? 'Update Unit' : 'Create Unit'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default UserManagement;
