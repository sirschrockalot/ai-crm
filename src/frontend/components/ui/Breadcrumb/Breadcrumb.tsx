import React from 'react';
import {
  Breadcrumb as ChakraBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  separator = <FiChevronRight />,
  maxItems = 5,
}) => {
  const router = useRouter();
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const activeColor = useColorModeValue('blue.600', 'blue.300');
  const hoverColor = useColorModeValue('blue.500', 'blue.200');

  // Generate breadcrumbs from router if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = router.asPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        isActive: router.asPath === '/',
        icon: <FiHome size={16} />,
      });
    }

    pathSegments.forEach((segment, idx) => {
      const href = '/' + pathSegments.slice(0, idx + 1).join('/');
      const isActive = idx === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: segment.replace(/-/g, ' ').replace(/_/g, ' '),
        href,
        isActive,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();
  
  // Limit items if maxItems is specified
  const displayItems = maxItems && breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1),
        { label: '...', href: '#', isActive: false },
        ...breadcrumbItems.slice(-maxItems + 2)
      ]
    : breadcrumbItems;

  const handleClick = (href: string, isActive: boolean) => {
    if (!isActive && href !== '#') {
      router.push(href);
    }
  };

  return (
    <ChakraBreadcrumb
      spacing="8px"
      separator={<BreadcrumbSeparator color={textColor}>{separator}</BreadcrumbSeparator>}
      fontSize={{ base: 'xs', md: 'sm' }}
      mb={4}
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
    >
      {displayItems.map((item, idx) => (
        <BreadcrumbItem key={item.href + idx}>
          <HStack spacing={1}>
            {item.icon && item.icon}
            <BreadcrumbLink
              href={item.href}
              onClick={() => handleClick(item.href, item.isActive)}
              color={item.isActive ? activeColor : textColor}
              _hover={{
                color: item.isActive ? activeColor : hoverColor,
                textDecoration: 'none',
              }}
              textTransform="capitalize"
              fontWeight={item.isActive ? 'semibold' : 'normal'}
              cursor={item.isActive ? 'default' : 'pointer'}
            >
              {item.label}
            </BreadcrumbLink>
          </HStack>
        </BreadcrumbItem>
      ))}
    </ChakraBreadcrumb>
  );
};
