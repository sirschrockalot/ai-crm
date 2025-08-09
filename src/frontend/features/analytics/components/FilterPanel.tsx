import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Select,
  Input,
  Checkbox,
  useDisclosure,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FilterPanelProps, AnalyticsFilters } from '../types/analytics';

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  availableFilters,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [localFilters, setLocalFilters] = useState<AnalyticsFilters>(filters);

  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: AnalyticsFilters = {
      timeRange: '30d',
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters(filters);
  };

  return (
    <VStack align="stretch" spacing={4} p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          <Icon as={FiFilter} />
          <Heading size="md">Filters</Heading>
        </HStack>
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button size="sm" variant="outline" onClick={handleClearFilters}>
            Clear All
          </Button>
          <IconButton
            size="sm"
            icon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
            aria-label="Toggle filters"
            onClick={onToggle}
            variant="ghost"
          />
        </HStack>
      </HStack>

      {/* Collapsible Filter Content */}
      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" spacing={4}>
          {/* Time Range */}
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" fontWeight="semibold">Time Range</Text>
            <Select
              value={localFilters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              maxW="200px"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </Select>
          </VStack>

          {/* Date Range */}
          <HStack spacing={4}>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">From Date</Text>
              <Input
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                maxW="150px"
              />
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">To Date</Text>
              <Input
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                maxW="150px"
              />
            </VStack>
          </HStack>

          {/* Lead Status Filter */}
          {availableFilters?.statuses && (
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">Lead Status</Text>
              <Select
                placeholder="Select status"
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                maxW="200px"
              >
                {availableFilters.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {/* Property Type Filter */}
          {availableFilters?.propertyTypes && (
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">Property Type</Text>
              <Select
                placeholder="Select property type"
                value={localFilters.propertyType || ''}
                onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
                maxW="200px"
              >
                {availableFilters.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {/* Buyer Type Filter */}
          {availableFilters?.buyerTypes && (
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">Buyer Type</Text>
              <Select
                placeholder="Select buyer type"
                value={localFilters.buyerType || ''}
                onChange={(e) => handleFilterChange('buyerType', e.target.value || undefined)}
                maxW="200px"
              >
                {availableFilters.buyerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {/* Team Member Filter */}
          {availableFilters?.teamMembers && (
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">Team Member</Text>
              <Select
                placeholder="Select team member"
                value={localFilters.teamMember || ''}
                onChange={(e) => handleFilterChange('teamMember', e.target.value || undefined)}
                maxW="200px"
              >
                {availableFilters.teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {/* Apply Filters Button */}
          <HStack justify="end" spacing={3}>
            <Button size="sm" variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button size="sm" colorScheme="blue" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </HStack>
        </VStack>
      </Collapse>

      {/* Active Filters Summary */}
      {isOpen && (
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" fontWeight="semibold">Active Filters:</Text>
          <HStack spacing={2} wrap="wrap">
            {Object.entries(localFilters).map(([key, value]) => {
              if (value && key !== 'timeRange') {
                return (
                  <Text
                    key={key}
                    fontSize="xs"
                    bg="blue.100"
                    px={2}
                    py={1}
                    borderRadius="md"
                    color="blue.800"
                  >
                    {key}: {value}
                  </Text>
                );
              }
              return null;
            })}
            {Object.entries(localFilters).every(([key, value]) => !value || key === 'timeRange') && (
              <Text fontSize="xs" color="gray.500">No additional filters applied</Text>
            )}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};
