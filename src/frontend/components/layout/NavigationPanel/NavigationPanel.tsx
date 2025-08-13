import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
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
  Flex,
  Spacer,
  useColorModeValue,
  Collapse,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useAccessibility, NAVIGATION_ARIA_LABELS, NAVIGATION_ARIA_ROLES } from '../../../hooks/useAccessibility';
import NavigationMenu from '../NavigationMenu';
import QuickActions from '../QuickActions';
import BreadcrumbNav from '../BreadcrumbNav';

interface NavigationPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // Use navigation context
  const { 
    state: { isCollapsed: navCollapsed, mobileCollapsed }, 
    toggleCollapse, 
    toggleMobileCollapsed,
    setCollapsed 
  } = useNavigation();
  
  // Use keyboard navigation
  const { handleKeyDown, createFocusTrap } = useKeyboardNavigation({
    onEscape: () => {
      if (isOpen) onClose();
    },
    onArrowLeft: () => {
      if (!navCollapsed) toggleCollapse();
    },
    onArrowRight: () => {
      if (navCollapsed) toggleCollapse();
    },
  });
  
  // Use accessibility features
  const { announce, getAccessibilityProps } = useAccessibility({
    role: NAVIGATION_ARIA_ROLES.navigation,
    'aria-label': NAVIGATION_ARIA_LABELS.navigation,
    'aria-live': 'polite',
  });
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle mobile collapse toggle
  const handleMobileToggle = useCallback(() => {
    toggleMobileCollapsed();
    announce(`Navigation ${mobileCollapsed ? 'expanded' : 'collapsed'}`);
  }, [mobileCollapsed, toggleMobileCollapsed, announce]);

  // Handle desktop collapse toggle
  const handleDesktopToggle = useCallback(() => {
    toggleCollapse();
    announce(`Navigation ${navCollapsed ? 'expanded' : 'collapsed'}`);
    if (onToggleCollapse) {
      onToggleCollapse(!navCollapsed);
    }
  }, [navCollapsed, toggleCollapse, onToggleCollapse, announce]);

  // Don't render mobile-specific content on server side
  if (isClient && isMobile) {
    return (
      <>
                <IconButton
          aria-label={NAVIGATION_ARIA_LABELS.navigationToggle}
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="ghost"
          size="lg"
          m={2}
          colorScheme="blue"
          {...getAccessibilityProps()}
        />
        <Drawer 
          isOpen={isOpen} 
          placement="left" 
          onClose={onClose} 
          size="full"
          onKeyDown={handleKeyDown}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader bg={bg} borderBottom="1px solid" borderColor={borderColor}>
              <HStack>
                <Text fontSize="lg" fontWeight="bold" color="blue.500">
                  DealCycle CRM
                </Text>
                <Spacer />
                <IconButton
                  aria-label={mobileCollapsed ? NAVIGATION_ARIA_LABELS.navigationExpand : NAVIGATION_ARIA_LABELS.navigationCollapse}
                  icon={mobileCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  onClick={handleMobileToggle}
                  variant="ghost"
                  size="sm"
                />
              </HStack>
            </DrawerHeader>
            <DrawerBody p={0} bg={bg}>
              <Collapse in={!mobileCollapsed}>
                <VStack align="stretch" spacing={0} h="full">
                  <NavigationMenu user={user} isMobile={true} />
                  <Divider />
                  <QuickActions user={user} isMobile={true} />
                </VStack>
              </Collapse>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop/Tablet navigation panel
  return (
    <Box
      as="nav"
      w={navCollapsed ? "16" : "64"}
      minH="100vh"
      bg={bg}
      borderRight="1px solid"
      borderColor={borderColor}
      transition="width 0.2s ease-in-out"
      position="relative"
      zIndex={10}
      onKeyDown={handleKeyDown}
      {...getAccessibilityProps()}
    >
      {/* Header with collapse toggle */}
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <HStack justify="space-between" align="center">
          {!navCollapsed && (
            <Text fontSize="lg" fontWeight="bold" color="blue.500" noOfLines={1}>
              DealCycle CRM
            </Text>
          )}
          <Spacer />
          <Tooltip label={navCollapsed ? "Expand navigation" : "Collapse navigation"}>
            <IconButton
              aria-label={navCollapsed ? NAVIGATION_ARIA_LABELS.navigationExpand : NAVIGATION_ARIA_LABELS.navigationCollapse}
              icon={navCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              onClick={handleDesktopToggle}
              variant="ghost"
              size="sm"
              colorScheme="blue"
            />
          </Tooltip>
        </HStack>
      </Box>

      {/* Navigation content */}
      <VStack align="stretch" spacing={0} h="calc(100vh - 80px)" overflow="hidden">
        <Box flex={1} overflowY="auto">
          <NavigationMenu user={user} isCollapsed={navCollapsed} />
        </Box>
        
        <Divider />
        
        <Box p={2}>
          <QuickActions user={user} isCollapsed={navCollapsed} />
        </Box>
      </VStack>
    </Box>
  );
};

export default NavigationPanel;
