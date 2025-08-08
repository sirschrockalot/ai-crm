import React from 'react';
import { Box, VStack, Link, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useBreakpointValue } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Leads', href: '/leads' },
  { label: 'Buyers', href: '/buyers' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Automation', href: '/automation' },
];

const Sidebar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarContent = (
    <VStack align="stretch" spacing={4} p={4}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} fontWeight="medium" _hover={{ color: 'primary.500' }}>
          {item.label}
        </Link>
      ))}
    </VStack>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="ghost"
          size="lg"
          m={2}
        />
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>{sidebarContent}</DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box as="nav" w="64" minH="100vh" bg="gray.50" borderRight="1px solid" borderColor="gray.200" p={4}>
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;