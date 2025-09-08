import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, HStack, VStack, Heading, Text, Button, Card, FormControl, FormLabel, Input, Select, Textarea, useToast, SimpleGrid } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { transactionsService } from '../../services/transactionsService';

const NewTransactionPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    propertyType: '',
    transactionType: '',
    loanType: '',
    clientAccount: '',
    preliminarySearch: '',
    jointVenture: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    sellerName: '',
    seller2Name: '',
    contractDate: '',
    acquisitionsAgent: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Minimal required fields validation matching screenshots
    if (!form.transactionType || !form.address || !form.city || !form.state || !form.contractDate || !form.notes) {
      toast({ title: 'Missing required fields', status: 'error', duration: 4000 });
      return;
    }
    const record = await transactionsService.create({
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      propertyType: form.propertyType,
      transactionType: form.transactionType,
      ...(form.loanType && { loanType: form.loanType }),
      clientAccount: form.clientAccount,
      preliminarySearch: form.preliminarySearch as any,
      jointVenture: form.jointVenture as any,
      sellerName: form.sellerName,
      seller2Name: form.seller2Name,
      acquisitionsAgent: form.acquisitionsAgent,
      contractDate: new Date(form.contractDate).toISOString(),
      notes: form.notes,
      documents: [],
    });
    toast({ title: 'Transaction created', status: 'success' });
    router.push(`/transactions`);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            <Heading size="lg">Contract: add new</Heading>

            <Card p={6}>
              <VStack align="stretch" spacing={6}>
                <FormControl>
                  <FormLabel>Property Type</FormLabel>
                  <Select name="propertyType" value={form.propertyType} onChange={handleChange} placeholder="Select...">
                    <option value="single_family">Single Family</option>
                    <option value="multi_family">Multi Family</option>
                    <option value="condo">Condo</option>
                    <option value="land">Land</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select name="transactionType" value={form.transactionType} onChange={handleChange} placeholder="Select...">
                    <option value="assignment">Assignment</option>
                    <option value="double_close">Double Close</option>
                    <option value="wholetail">Wholetail</option>
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Subject to underlying loan type</FormLabel>
                    <Select name="loanType" value={form.loanType} onChange={handleChange} placeholder="Select...">
                      <option value="conventional">Conventional</option>
                      <option value="fha">FHA</option>
                      <option value="va">VA</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Client Account</FormLabel>
                    <Input name="clientAccount" value={form.clientAccount} onChange={handleChange} placeholder="Select or enter..." />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Preliminary title search?</FormLabel>
                    <Select name="preliminarySearch" value={form.preliminarySearch} onChange={handleChange} placeholder="Select...">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Joint Venture?</FormLabel>
                    <Select name="jointVenture" value={form.jointVenture} onChange={handleChange} placeholder="Select...">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Card>

            <Card p={6}>
              <Heading size="md" mb={4}>Property Details</Heading>
              <VStack align="stretch" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Address</FormLabel>
                  <Input name="address" value={form.address} onChange={handleChange} />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input name="city" value={form.city} onChange={handleChange} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>State</FormLabel>
                    <Select name="state" value={form.state} onChange={handleChange} placeholder="Select...">
                      {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Zip</FormLabel>
                    <Input name="zip" value={form.zip} onChange={handleChange} />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Card>

            <Card p={6}>
              <Heading size="md" mb={4}>Seller Information</Heading>
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Seller Name</FormLabel>
                    <Input name="sellerName" value={form.sellerName} onChange={handleChange} placeholder="Select or enter..." />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Seller 2 name</FormLabel>
                    <Input name="seller2Name" value={form.seller2Name} onChange={handleChange} placeholder="Select or enter..." />
                  </FormControl>
                </SimpleGrid>
                <FormControl isRequired>
                  <FormLabel>Acquisitions Contract Date</FormLabel>
                  <Input type="date" name="contractDate" value={form.contractDate} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Acquisitions Agent</FormLabel>
                  <Input name="acquisitionsAgent" value={form.acquisitionsAgent} onChange={handleChange} placeholder="Select or enter..." />
                </FormControl>
              </VStack>
            </Card>

            <Card p={6}>
              <Heading size="md" mb={4}>Tell Us About the Property</Heading>
              <FormControl isRequired>
                <FormLabel>Notes</FormLabel>
                <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Is there anything we should know about this property?" />
              </FormControl>
            </Card>

            <HStack justify="flex-end">
              <Button variant="ghost" onClick={() => router.push('/transactions')}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit}>Save</Button>
            </HStack>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default NewTransactionPage;


