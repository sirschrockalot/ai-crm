import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Link,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useBreakpointValue,
  Text,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import {
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiSmartphone,
  FiDollarSign,
  FiTarget,
  FiActivity,
  FiClock,
} from 'react-icons/fi';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: FiBarChart,
    description: 'Choose your dashboard type'
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: FiTarget,
    description: 'Lead management'
  },
  {
    label: 'Buyers',
    href: '/buyers',
    icon: FiUsers,
    description: 'Buyer management'
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: FiTrendingUp,
    description: 'Business analytics'
  },
  {
    label: 'Automation',
    href: '/automation',
    icon: FiActivity,
    description: 'Workflow automation'
  },
];

const Sidebar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isClient, setIsClient] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sidebarContent = (
    <VStack align="stretch" spacing={4} p={4}>
      {/* Dashboard Section */}
      <Box>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">
          Dashboards
        </Text>
        <VStack align="stretch" spacing={2}>
                    <Link 
            href="/dashboard" 
            fontWeight="medium" 
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'blue.500', bg: 'blue.50' }}
          >
            <FiBarChart style={{ marginRight: '8px' }} />
            Overview
          </Link>
                    <Link 
            href="/dashboard/executive" 
            fontWeight="medium" 
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'green.500', bg: 'green.50' }}
          >
            <FiTrendingUp style={{ marginRight: '8px' }} />
            Executive
          </Link>
          <Link
            href="/dashboard/acquisitions"
            fontWeight="medium"
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'purple.500', bg: 'purple.50' }}
          >
            <FiTarget style={{ marginRight: '8px' }} />
            Acquisitions
          </Link>
          <Link
            href="/dashboard/disposition"
            fontWeight="medium"
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'orange.500', bg: 'orange.50' }}
          >
            <FiDollarSign style={{ marginRight: '8px' }} />
            Dispositions
          </Link>
          <Link
            href="/dashboard/team-member"
            fontWeight="medium"
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'teal.500', bg: 'teal.50' }}
          >
            <FiUsers style={{ marginRight: '8px' }} />
            Team Member
          </Link>
          <Link
            href="/dashboard/mobile"
            fontWeight="medium"
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'pink.500', bg: 'pink.50' }}
          >
            <FiSmartphone style={{ marginRight: '8px' }} />
            Mobile
          </Link>
          <Link
            href="/dashboard/time-tracking"
            fontWeight="medium"
            display="flex"
            alignItems="center"
            p={2}
            borderRadius="md"
            _hover={{ color: 'blue.600', bg: 'blue.50' }}
          >
            <FiClock style={{ marginRight: '8px' }} />
            Time Tracking
          </Link>
        </VStack>
      </Box>

      <Divider />

      {/* Main Navigation */}
      <Box>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">
          Main Navigation
        </Text>
        <VStack align="stretch" spacing={2}>
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              fontWeight="medium"
              display="flex"
              alignItems="center"
              p={2}
              borderRadius="md"
              _hover={{ color: 'primary.500', bg: 'gray.100' }}
            >
              <item.icon style={{ marginRight: '8px' }} />
              {item.label}
            </Link>
          ))}
        </VStack>
      </Box>
    </VStack>
  );

  // Don't render mobile-specific content on server side
  if (isClient && isMobile) {
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