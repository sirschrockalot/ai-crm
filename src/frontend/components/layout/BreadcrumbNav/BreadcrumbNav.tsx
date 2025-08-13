import React, { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { useRouter } from 'next/router';

interface BreadcrumbNavProps {
  showHome?: boolean;
  customBreadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  showHome = true,
  customBreadcrumbs,
}) => {
  const router = useRouter();
  
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = useColorModeValue('gray.800', 'gray.200');
  const separatorColor = useColorModeValue('gray.400', 'gray.500');

  // Generate breadcrumbs from current route
  const routeBreadcrumbs = useMemo(() => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = router.asPath.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Add home breadcrumb if enabled
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
      });
    }

    // Generate breadcrumbs from path segments
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // Convert segment to readable label
      let label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Handle special cases
      if (segment === 'dashboard') {
        label = 'Dashboard';
      } else if (segment === 'leads') {
        label = 'Leads';
      } else if (segment === 'buyers') {
        label = 'Buyers';
      } else if (segment === 'analytics') {
        label = 'Analytics';
      } else if (segment === 'communications') {
        label = 'Communications';
      } else if (segment === 'time-tracking') {
        label = 'Time Tracking';
      } else if (segment === 'settings') {
        label = 'Settings';
      } else if (segment === 'admin') {
        label = 'Administration';
      }

      breadcrumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : href, // Last item is not clickable
      });
    });

    return breadcrumbs;
  }, [router.asPath, customBreadcrumbs, showHome]);

  // Don't render if no breadcrumbs
  if (routeBreadcrumbs.length === 0) {
    return null;
  }

  return (
    <HStack spacing={2} align="center" mb={4}>
      <Icon as={FiHome} boxSize={4} color={textColor} />
      
      <Breadcrumb
        spacing="8px"
        separator={<FiChevronRight color={separatorColor} />}
        fontSize="sm"
      >
        {routeBreadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem key={breadcrumb.label}>
            {breadcrumb.href ? (
              <BreadcrumbLink
                href={breadcrumb.href}
                color={textColor}
                _hover={{ color: activeColor, textDecoration: 'underline' }}
                transition="color 0.2s"
              >
                {breadcrumb.label}
              </BreadcrumbLink>
            ) : (
              <Text color={activeColor} fontWeight="medium">
                {breadcrumb.label}
              </Text>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </HStack>
  );
};

export default BreadcrumbNav;
