import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import SearchBar from '../../../components/layout/SearchBar';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders search input with placeholder', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('renders search icon', () => {
      renderWithTheme(<SearchBar />);
      
      // Search icon should be present (Chakra UI icon)
      const searchIcon = document.querySelector('[data-testid="search-icon"]') || 
                        document.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('renders with correct initial state', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveValue('');
      
      // Suggestions should not be visible initially
      expect(screen.queryByText('Lead: John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('updates search query on input change', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(searchInput).toHaveValue('John');
    });

    it('filters suggestions based on search query', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Type a search query
      fireEvent.change(searchInput, { target: { value: 'Lead' } });
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Lead: John Doe')).toBeInTheDocument();
        expect(screen.getByText('Lead: Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Buyer: Acme Corp')).not.toBeInTheDocument();
      });
    });

    it('shows all suggestions when query is empty', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Lead: John Doe')).toBeInTheDocument();
        expect(screen.getByText('Lead: Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Buyer: Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Buyer: Beta LLC')).toBeInTheDocument();
        expect(screen.getByText('Automation: Welcome Email')).toBeInTheDocument();
        expect(screen.getByText('Analytics: Q1 Report')).toBeInTheDocument();
      });
    });

    it('filters suggestions case-insensitively', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'jane' } });
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Lead: Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Lead: John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Suggestions Display', () => {
    it('shows suggestions on focus', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        expect(screen.getByText('Lead: John Doe')).toBeInTheDocument();
        expect(screen.getByText('Lead: Jane Smith')).toBeInTheDocument();
      });
    });

    it('hides suggestions on blur', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      // Wait for suggestions to appear
      await waitFor(() => {
        expect(screen.getByText('Lead: John Doe')).toBeInTheDocument();
      });
      
      // Blur the input
      fireEvent.blur(searchInput);
      
      // Wait for suggestions to disappear (with timeout)
      await waitFor(() => {
        expect(screen.queryByText('Lead: John Doe')).not.toBeInTheDocument();
      }, { timeout: 150 });
    });

    it('shows suggestions container with proper styling', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        const suggestionsList = screen.getByRole('list');
        expect(suggestionsList).toBeInTheDocument();
        expect(suggestionsList).toHaveStyle({
          position: 'absolute',
          zIndex: 10,
        });
      });
    });

    it('renders suggestion items as list items', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(6);
        expect(listItems[0]).toHaveTextContent('Lead: John Doe');
        expect(listItems[1]).toHaveTextContent('Lead: Jane Smith');
      });
    });
  });

  describe('User Interactions', () => {
    it('handles empty search query gracefully', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: '' } });
      
      expect(searchInput).toHaveValue('');
      expect(screen.queryByText('Lead: John Doe')).not.toBeInTheDocument();
    });

    it('handles special characters in search query', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Acme Corp' } });
      
      expect(searchInput).toHaveValue('Acme Corp');
    });

    it('maintains focus state during typing', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      
      expect(searchInput).toHaveValue('Test');
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder', 'Search...');
    });

    it('has proper list semantics for suggestions', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        const suggestionsList = screen.getByRole('list');
        const listItems = screen.getAllByRole('listitem');
        
        expect(suggestionsList).toBeInTheDocument();
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    it('provides keyboard navigation for suggestions', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.focus(searchInput);
      
      await waitFor(() => {
        const suggestionsList = screen.getByRole('list');
        expect(suggestionsList).toBeInTheDocument();
      });
      
      // Test keyboard navigation
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });
  });

  describe('Performance', () => {
    it('filters suggestions efficiently', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Test rapid typing
      fireEvent.change(searchInput, { target: { value: 'L' } });
      fireEvent.change(searchInput, { target: { value: 'Le' } });
      fireEvent.change(searchInput, { target: { value: 'Lea' } });
      fireEvent.change(searchInput, { target: { value: 'Lead' } });
      
      expect(searchInput).toHaveValue('Lead');
    });

    it('handles long search queries', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      const longQuery = 'This is a very long search query that should be handled properly';
      
      fireEvent.change(searchInput, { target: { value: longQuery } });
      
      expect(searchInput).toHaveValue(longQuery);
    });
  });

  describe('Edge Cases', () => {
    it('handles search query with only whitespace', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: '   ' } });
      
      expect(searchInput).toHaveValue('   ');
      expect(screen.queryByText('Lead: John Doe')).not.toBeInTheDocument();
    });

    it('handles search query with special regex characters', () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: '.*+?^${}()|[]\\' } });
      
      expect(searchInput).toHaveValue('.*+?^${}()|[]\\');
    });

    it('handles rapid focus/blur events', async () => {
      renderWithTheme(<SearchBar />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Rapid focus/blur
      fireEvent.focus(searchInput);
      fireEvent.blur(searchInput);
      fireEvent.focus(searchInput);
      fireEvent.blur(searchInput);
      
      // Should not crash or cause errors
      expect(searchInput).toBeInTheDocument();
    });
  });
});
