import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const Navigation: React.FC = () => {
  const router = useRouter();
  const pathSegments = router.asPath.split('/').filter(Boolean);

  return (
    <Breadcrumb fontSize="sm" mb={4}>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      {pathSegments.map((segment, idx) => {
        const href = '/' + pathSegments.slice(0, idx + 1).join('/');
        return (
          <BreadcrumbItem key={href} isCurrentPage={idx === pathSegments.length - 1}>
            <BreadcrumbLink href={href} textTransform="capitalize">
              {segment.replace(/-/g, ' ')}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Navigation;