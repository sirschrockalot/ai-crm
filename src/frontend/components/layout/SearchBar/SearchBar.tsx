import React, { useState } from 'react';
import { InputGroup, InputLeftElement, Input, List, ListItem, Box } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const mockSuggestions = [
  'Lead: John Doe',
  'Lead: Jane Smith',
  'Buyer: Acme Corp',
  'Buyer: Beta LLC',
  'Automation: Welcome Email',
  'Analytics: Q1 Report',
];

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions =
    query.length > 0
      ? mockSuggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
      : [];

  return (
    <Box position="relative" w="full" maxW="400px">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
      </InputGroup>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <List position="absolute" zIndex={10} w="full" bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" mt={1} boxShadow="md">
          {filteredSuggestions.map((suggestion) => (
            <ListItem key={suggestion} px={4} py={2} _hover={{ bg: 'gray.50' }} cursor="pointer">
              {suggestion}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchBar;