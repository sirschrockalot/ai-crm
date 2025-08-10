import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Flex,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiUsers, 
  FiShield, 
  FiBell, 
  FiSettings, 
  FiDatabase, 
  FiBarChart, 
  FiCreditCard,
  FiSmartphone,
  FiGitBranch,
  FiCode
} from 'react-icons/fi';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  component: React.ComponentType<any>;
}

interface SettingsLayoutProps {
  sections: SettingsSection[];
  defaultSection?: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ sections, defaultSection }) => {
  const [activeSection, setActiveSection] = useState(defaultSection || sections[0]?.id);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeBorderColor = useColorModeValue('blue.500', 'blue.400');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || (() => null);
  const activeSectionData = sections.find(s => s.id === activeSection);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Flex>
        {/* Settings Sidebar */}
        <Box
          w="280px"
          bg={bgColor}
          borderRight="1px"
          borderColor={borderColor}
          minH="100vh"
          position="sticky"
          top="0"
        >
          <VStack spacing={0} align="stretch">
            {/* Sidebar Header */}
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                Settings
              </Text>
              <Text fontSize="sm" color={mutedTextColor} mt={1}>
                Manage your account and system preferences
              </Text>
            </Box>

            {/* Navigation Items */}
            <VStack spacing={0} align="stretch" p={4}>
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                const IconComponent = section.icon;
                return (
                  <Box
                    key={section.id}
                    p={4}
                    cursor="pointer"
                    borderRadius="lg"
                    bg={isActive ? activeBg : 'transparent'}
                    borderRight={isActive ? '3px solid' : 'none'}
                    borderColor={isActive ? activeBorderColor : 'transparent'}
                    _hover={{
                      bg: isActive ? activeBg : hoverBg,
                    }}
                    onClick={() => setActiveSection(section.id)}
                    transition="all 0.2s"
                  >
                    <HStack spacing={3}>
                      <Icon
                        as={IconComponent}
                        boxSize={5}
                        color={isActive ? 'blue.500' : mutedTextColor}
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={isActive ? 'blue.600' : textColor}
                        >
                          {section.label}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={mutedTextColor}
                          noOfLines={2}
                        >
                          {section.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </VStack>
        </Box>

        {/* Content Area */}
        <Box flex={1} p={8}>
          {/* Breadcrumb Navigation */}
          <Breadcrumb mb={6} fontSize="sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            {activeSectionData && (
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{activeSectionData.label}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Breadcrumb>

          {/* Active Component */}
          <ActiveComponent />
        </Box>
      </Flex>
    </Box>
  );
};

export default SettingsLayout;
