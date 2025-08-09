import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Heading, Text, Card, Badge, Button, Progress, Select, Input, Grid, GridItem } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { useBuyers } from '../../hooks/services/useBuyers';
import { Buyer } from '../../types';

// Mock data for buyer-lead matches
interface BuyerLeadMatch {
  id: string;
  buyer: Buyer;
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    propertyType: string;
    estimatedValue: number;
    city: string;
    state: string;
  };
  matchScore: number;
  matchReason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'contacted';
  createdAt: Date;
}

const BuyerLeadMatchingPage: React.FC = () => {
  const { buyers, loading, error, fetchBuyers } = useBuyers();
  const [matches, setMatches] = useState<BuyerLeadMatch[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBuyers();
    // TODO: Fetch actual buyer-lead matches from API
    // For now, generate mock data
    generateMockMatches();
  }, [fetchBuyers]);

  const generateMockMatches = () => {
    if (!buyers.length) return;

    const mockLeads = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        propertyType: 'single_family',
        estimatedValue: 250000,
        city: 'Austin',
        state: 'TX'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        propertyType: 'multi_family',
        estimatedValue: 450000,
        city: 'Dallas',
        state: 'TX'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@email.com',
        propertyType: 'commercial',
        estimatedValue: 750000,
        city: 'Houston',
        state: 'TX'
      }
    ];

    const mockMatches: BuyerLeadMatch[] = buyers.slice(0, 3).map((buyer, index) => ({
      id: `match-${index + 1}`,
      buyer,
      lead: mockLeads[index % mockLeads.length],
      matchScore: Math.floor(Math.random() * 40) + 60, // 60-100
      matchReason: getMatchReason(buyer, mockLeads[index % mockLeads.length]),
      status: ['pending', 'accepted', 'rejected', 'contacted'][Math.floor(Math.random() * 4)] as any,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in last 7 days
    }));

    setMatches(mockMatches);
  };

  const getMatchReason = (buyer: Buyer, lead: any) => {
    const reasons = [];
    if (buyer.preferredPropertyTypes.includes(lead.propertyType)) {
      reasons.push('Property type match');
    }
    if (buyer.city === lead.city) {
      reasons.push('Location match');
    }
    if (buyer.investmentRange === getInvestmentRange(lead.estimatedValue)) {
      reasons.push('Price range match');
    }
    return reasons.join(', ') || 'General compatibility';
  };

  const getInvestmentRange = (value: number) => {
    if (value <= 50000) return '0-50k';
    if (value <= 100000) return '50k-100k';
    if (value <= 250000) return '100k-250k';
    if (value <= 500000) return '250k-500k';
    return '500k+';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'contacted': return 'blue';
      default: return 'gray';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  const filteredMatches = matches.filter(match => {
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
    const matchesScore = filterScore === 'all' || 
      (filterScore === 'high' && match.matchScore >= 90) ||
      (filterScore === 'medium' && match.matchScore >= 70 && match.matchScore < 90) ||
      (filterScore === 'low' && match.matchScore < 70);
    const matchesSearch = searchTerm === '' || 
      match.buyer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.buyer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.lead.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesScore && matchesSearch;
  });

  const handleStatusChange = (matchId: string, newStatus: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, status: newStatus as any } : match
    ));
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Loading matches...</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text color="red.500">Error loading matches: {error}</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg">Buyer-Lead Matching</Heading>
                <Text color="gray.600">Find and manage potential buyer-lead matches</Text>
              </VStack>
              <Button variant="primary">
                Generate New Matches
              </Button>
            </HStack>

            {/* Filters */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="sm">Filters</Heading>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Search</Text>
                    <Input
                      placeholder="Search buyers or leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Status</Text>
                    <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="contacted">Contacted</option>
                    </Select>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Match Score</Text>
                    <Select value={filterScore} onChange={(e) => setFilterScore(e.target.value)}>
                      <option value="all">All Scores</option>
                      <option value="high">High (90+)</option>
                      <option value="medium">Medium (70-89)</option>
                      <option value="low">Low (&lt;70)</option>
                    </Select>
                  </Box>
                </Grid>
              </VStack>
            </Card>

            {/* Stats */}
            <HStack spacing={4}>
              <Card>
                <Text fontSize="sm" color="gray.600">Total Matches</Text>
                <Text fontSize="2xl" fontWeight="bold">{matches.length}</Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">High Quality</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {matches.filter(m => m.matchScore >= 90).length}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Pending Review</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {matches.filter(m => m.status === 'pending').length}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Accepted</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {matches.filter(m => m.status === 'accepted').length}
                </Text>
              </Card>
            </HStack>

            {/* Matches List */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Potential Matches ({filteredMatches.length})</Heading>
                {filteredMatches.length === 0 ? (
                  <Text color="gray.600" textAlign="center" py={8}>
                    No matches found with current filters
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {filteredMatches.map((match) => (
                      <Box key={match.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                        <HStack justify="space-between" align="start" mb={4}>
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack spacing={4}>
                              <Text fontWeight="semibold">
                                {match.buyer.companyName} → {match.lead.firstName} {match.lead.lastName}
                              </Text>
                              <Badge colorScheme={getScoreColor(match.matchScore)}>
                                {match.matchScore}% Match
                              </Badge>
                              <Badge colorScheme={getStatusColor(match.status)}>
                                {match.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">{match.matchReason}</Text>
                          </VStack>
                          <VStack spacing={2}>
                            <Select
                              size="sm"
                              value={match.status}
                              onChange={(e) => handleStatusChange(match.id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accept</option>
                              <option value="rejected">Reject</option>
                              <option value="contacted">Contact</option>
                            </Select>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </VStack>
                        </HStack>
                        
                        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">Buyer Details</Text>
                            <Text fontSize="sm">{match.buyer.contactName}</Text>
                            <Text fontSize="sm" color="gray.600">{match.buyer.email}</Text>
                            <Text fontSize="sm" color="gray.600">{match.buyer.city}, {match.buyer.state}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">Lead Details</Text>
                            <Text fontSize="sm">{match.lead.firstName} {match.lead.lastName}</Text>
                            <Text fontSize="sm" color="gray.600">{match.lead.email}</Text>
                            <Text fontSize="sm" color="gray.600">{match.lead.city}, {match.lead.state}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold">Property</Text>
                            <Text fontSize="sm" textTransform="capitalize">{match.lead.propertyType.replace('_', ' ')}</Text>
                            <Text fontSize="sm" color="gray.600">${match.lead.estimatedValue.toLocaleString()}</Text>
                          </Box>
                        </Grid>
                      </Box>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default BuyerLeadMatchingPage;
