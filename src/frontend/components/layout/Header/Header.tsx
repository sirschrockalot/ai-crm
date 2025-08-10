import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Spacer, IconButton, Avatar, Menu, MenuButton, MenuList, MenuItem, useColorMode, useColorModeValue, Badge } from '@chakra-ui/react';
import { BellIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
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
          <MenuButton as={Avatar} size="sm" ml={4} name="User" />
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default Header;