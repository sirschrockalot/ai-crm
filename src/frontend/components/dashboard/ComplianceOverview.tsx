import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Button,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ViewIcon, 
  ExternalLinkIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
  TimeIcon,
  CheckIcon,
  CloseIcon,
} from '@chakra-ui/icons';

interface ComplianceRequirement {
  id: string;
  name: string;
  category: 'financial' | 'operational' | 'data' | 'regulatory' | 'environmental';
  status: 'compliant' | 'non-compliant' | 'pending' | 'review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  lastAudit: string;
  nextAudit: string;
  description: string;
  requirements: string[];
  risks: string[];
}

interface AuditFinding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo: string;
  dueDate: string;
  lastUpdated: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effectiveDate: string;
  complianceDeadline: string;
  affectedAreas: string[];
  actionRequired: string;
  status: 'pending' | 'in-progress' | 'implemented' | 'monitoring';
}

interface ComplianceOverviewProps {
  requirements: ComplianceRequirement[];
  findings: AuditFinding[];
  updates: RegulatoryUpdate[];
  variant?: 'executive' | 'detailed';
  onRequirementClick?: (requirement: ComplianceRequirement) => void;
  onFindingClick?: (finding: AuditFinding) => void;
  onUpdateClick?: (update: RegulatoryUpdate) => void;
  onViewDetails?: () => void;
}

export const ComplianceOverview: React.FC<ComplianceOverviewProps> = ({
  requirements,
  findings,
  updates,
  variant = 'executive',
  onRequirementClick,
  onFindingClick,
  onUpdateClick,
  onViewDetails,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [showAllFindings, setShowAllFindings] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status: string) => {
    const colors = {
      compliant: 'green',
      'non-compliant': 'red',
      pending: 'yellow',
      review: 'blue',
    };
    return (colors as any)[status] || 'gray';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      compliant: <CheckCircleIcon color="green.500" />,
      'non-compliant': <CloseIcon color="red.500" />,
      pending: <TimeIcon color="yellow.500" />,
      review: <InfoIcon color="blue.500" />,
    };
    return (icons as any)[status] || <InfoIcon />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return (colors as any)[priority] || 'gray';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return (colors as any)[severity] || 'gray';
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return (colors as any)[impact] || 'gray';
  };

  const getFindingStatusColor = (status: string) => {
    const colors = {
      open: 'red',
      'in-progress': 'yellow',
      resolved: 'green',
      closed: 'gray',
    };
    return (colors as any)[status] || 'gray';
  };

  const getUpdateStatusColor = (status: string) => {
    const colors = {
      pending: 'yellow',
      'in-progress': 'blue',
      implemented: 'green',
      monitoring: 'purple',
    };
    return (colors as any)[status] || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleRequirementClick = (requirement: ComplianceRequirement) => {
    if (onRequirementClick) {
      onRequirementClick(requirement);
    }
  };

  const handleFindingClick = (finding: AuditFinding) => {
    if (onFindingClick) {
      onFindingClick(finding);
    }
  };

  const handleUpdateClick = (update: RegulatoryUpdate) => {
    if (onUpdateClick) {
      onUpdateClick(update);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const nonCompliantRequirements = requirements.filter(r => r.status === 'non-compliant');
  const overdueRequirements = requirements.filter(r => isOverdue(r.dueDate));
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const openFindings = findings.filter(f => f.status === 'open');
  const criticalUpdates = updates.filter(u => u.impact === 'critical');

  const complianceScore = Math.round(
    (requirements.filter(r => r.status === 'compliant').length / requirements.length) * 100
  );

  return (
    <Box bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor} p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Compliance Overview
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<ViewIcon />}
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </HStack>
      </HStack>

      {/* Compliance Score Summary */}
      <Box mb={6} p={4} bg={hoverBg} borderRadius="md" border="1px" borderColor={borderColor}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <Stat>
            <StatLabel>Overall Compliance</StatLabel>
            <StatNumber color={complianceScore >= 90 ? 'green.500' : complianceScore >= 70 ? 'yellow.500' : 'red.500'}>
              {complianceScore}%
            </StatNumber>
            <StatHelpText>
              <StatArrow type={complianceScore >= 90 ? 'increase' : 'decrease'} />
              {complianceScore >= 90 ? 'Excellent' : complianceScore >= 70 ? 'Good' : 'Needs Attention'}
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Total Requirements</StatLabel>
            <StatNumber>{requirements.length}</StatNumber>
            <StatHelpText>Compliance items</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Non-Compliant</StatLabel>
            <StatNumber color="red.500">{nonCompliantRequirements.length}</StatNumber>
            <StatHelpText>Requires action</StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Overdue</StatLabel>
            <StatNumber color="orange.500">{overdueRequirements.length}</StatNumber>
            <StatHelpText>Past due date</StatHelpText>
          </Stat>
        </Grid>
      </Box>

      <VStack spacing={6} align="stretch">
        {/* Compliance Requirements */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('requirements')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Compliance Requirements
              </Text>
              {nonCompliantRequirements.length > 0 && (
                <Badge colorScheme="red" variant="solid">
                  {nonCompliantRequirements.length} Non-Compliant
                </Badge>
              )}
              {overdueRequirements.length > 0 && (
                <Badge colorScheme="orange" variant="solid">
                  {overdueRequirements.length} Overdue
                </Badge>
              )}
            </HStack>
            {expandedSection === 'requirements' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'requirements'}>
            <Box mt={4}>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(400px, 1fr))',
                }}
                gap={4}
              >
                {(showAllRequirements ? requirements : requirements.slice(0, 4)).map((requirement) => (
                  <Box
                    key={requirement.id}
                    bg={hoverBg}
                    border="1px"
                    borderColor={isOverdue(requirement.dueDate) ? 'red.300' : borderColor}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      shadow: 'md',
                      borderColor: 'blue.300',
                    }}
                    onClick={() => handleRequirementClick(requirement)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        {getStatusIcon(requirement.status)}
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          {requirement.name}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={getStatusColor(requirement.status)} variant="subtle">
                          {requirement.status.toUpperCase()}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(requirement.priority)} variant="solid">
                          {requirement.priority.toUpperCase()}
                        </Badge>
                      </HStack>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        {requirement.description}
                      </Text>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Category:</strong> {requirement.category}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Due:</strong> {formatDate(requirement.dueDate)}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Last Audit:</strong> {formatDate(requirement.lastAudit)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Next Audit:</strong> {formatDate(requirement.nextAudit)}
                        </Text>
                      </HStack>
                      
                      {isOverdue(requirement.dueDate) && (
                        <Alert status="error" size="sm" borderRadius="md">
                          <AlertIcon />
                          <AlertDescription fontSize="xs">
                            Overdue by {Math.ceil((new Date().getTime() - new Date(requirement.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </AlertDescription>
                        </Alert>
                      )}
                    </VStack>
                  </Box>
                ))}
                
                {requirements.length > 4 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllRequirements(!showAllRequirements)}
                  >
                    {showAllRequirements ? 'Show Less' : `Show All ${requirements.length} Requirements`}
                  </Button>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* Audit Findings */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('findings')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Audit Findings
              </Text>
              {criticalFindings.length > 0 && (
                <Badge colorScheme="red" variant="solid">
                  {criticalFindings.length} Critical
                </Badge>
              )}
              {openFindings.length > 0 && (
                <Badge colorScheme="orange" variant="solid">
                  {openFindings.length} Open
                </Badge>
              )}
            </HStack>
            {expandedSection === 'findings' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'findings'}>
            <Box mt={4}>
              {criticalFindings.length > 0 && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Critical Findings!</AlertTitle>
                    <AlertDescription>
                      {criticalFindings.length} critical audit findings require immediate attention.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(400px, 1fr))',
                }}
                gap={4}
              >
                {(showAllFindings ? findings : findings.slice(0, 3)).map((finding) => (
                  <Box
                    key={finding.id}
                    bg={hoverBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      shadow: 'md',
                      borderColor: 'blue.300',
                    }}
                    onClick={() => handleFindingClick(finding)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {finding.title}
                      </Text>
                      <HStack spacing={2}>
                        <Badge colorScheme={getSeverityColor(finding.severity)} variant="solid">
                          {finding.severity.toUpperCase()}
                        </Badge>
                        <Badge colorScheme={getFindingStatusColor(finding.status)} variant="subtle">
                          {finding.status.toUpperCase()}
                        </Badge>
                      </HStack>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        {finding.description}
                      </Text>
                      
                      <Text fontSize="sm" color="gray.600">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </Text>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Category:</strong> {finding.category}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Assigned:</strong> {finding.assignedTo}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Due:</strong> {formatDate(finding.dueDate)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Updated:</strong> {formatDate(finding.lastUpdated)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
                
                {findings.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllFindings(!showAllFindings)}
                  >
                    {showAllFindings ? 'Show Less' : `Show All ${findings.length} Findings`}
                  </Button>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* Regulatory Updates */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('updates')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Regulatory Updates
              </Text>
              {criticalUpdates.length > 0 && (
                <Badge colorScheme="red" variant="solid">
                  {criticalUpdates.length} Critical
                </Badge>
              )}
            </HStack>
            {expandedSection === 'updates' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'updates'}>
            <Box mt={4}>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(400px, 1fr))',
                }}
                gap={4}
              >
                {(showAllUpdates ? updates : updates.slice(0, 3)).map((update) => (
                  <Box
                    key={update.id}
                    bg={hoverBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      shadow: 'md',
                      borderColor: 'blue.300',
                    }}
                    onClick={() => handleUpdateClick(update)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {update.title}
                      </Text>
                      <HStack spacing={2}>
                        <Badge colorScheme={getImpactColor(update.impact)} variant="solid">
                          {update.impact.toUpperCase()}
                        </Badge>
                        <Badge colorScheme={getUpdateStatusColor(update.status)} variant="subtle">
                          {update.status.toUpperCase()}
                        </Badge>
                      </HStack>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        {update.description}
                      </Text>
                      
                      <Text fontSize="sm" color="gray.600">
                        <strong>Action Required:</strong> {update.actionRequired}
                      </Text>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Effective:</strong> {formatDate(update.effectiveDate)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Deadline:</strong> {formatDate(update.complianceDeadline)}
                        </Text>
                      </HStack>
                      
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          <strong>Affected Areas:</strong>
                        </Text>
                        <HStack flexWrap="wrap" spacing={1}>
                          {update.affectedAreas.slice(0, 3).map((area, index) => (
                            <Badge key={index} colorScheme="blue" variant="subtle" size="sm">
                              {area}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>
                ))}
                
                {updates.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllUpdates(!showAllUpdates)}
                  >
                    {showAllUpdates ? 'Show Less' : `Show All ${updates.length} Updates`}
                  </Button>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
};
