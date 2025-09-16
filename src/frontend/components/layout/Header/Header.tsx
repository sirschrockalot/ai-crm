import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Spacer, IconButton, Avatar, Menu, MenuButton, MenuList, MenuItem, useColorMode, useColorModeValue, Badge, Text } from '@chakra-ui/react';
import { BellIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { getDisplayName, getUserInitials } from '../../../utils/userUtils';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const bg = useColorModeValue('white', 'gray.900');

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box as="header" w="full" bg={bg} px={6} py={3} boxShadow="sm" borderBottom="1px solid" borderColor="gray.200">
      <Flex align="center">
        <Heading size="md" color="primary.500">DealCycle CRM</Heading>
        <Spacer />
        {isClient && (
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={2}
          />
        )}
        <Menu>
          <MenuButton as={IconButton} icon={<BellIcon />} variant="ghost" aria-label="Notifications">
            <Badge colorScheme="red" borderRadius="full" ml={-2} mt={-2} fontSize="0.7em">3</Badge>
          </MenuButton>
          <MenuList>
            <MenuItem>No new notifications</MenuItem>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton
            p={0}
            ml={4}
            borderRadius="full"
            display="inline-flex"
            _hover={{ opacity: 0.9 }}
            _active={{ opacity: 0.95 }}
            _focus={{ boxShadow: 'outline' }}
          >
            <Avatar
              size="sm"
              name={getDisplayName(user?.firstName, user?.lastName, user?.email)}
              src={isAuthenticated && user?.picture ? user.picture : undefined}
              bg={isAuthenticated ? 'green.400' : 'gray.300'}
              color={isAuthenticated ? 'white' : 'gray.700'}
            />
          </MenuButton>
          <MenuList>
            {isAuthenticated && user && (
              <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.200">
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  {getDisplayName(user.firstName, user.lastName, user.email)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user.email}
                </Text>
              </Box>
            )}
            <MenuItem onClick={() => router.push('/profile')}>Profile</MenuItem>
            <MenuItem onClick={() => router.push('/settings')}>Settings</MenuItem>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default Header;