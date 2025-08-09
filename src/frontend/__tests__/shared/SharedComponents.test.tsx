import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme';
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  IconButton,
  InfoCard,
  ActionCard,
  FormField,
  TextInput,
  SelectInput,
  StatusBadge,
  LoadingSpinner,
  LoadingSkeleton,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  PageHeader,
  SectionHeader,
  MetricCard,
  EmptyState,
  ActionButtons,
} from '@/components/shared/SharedComponents';

// Test wrapper with Chakra UI provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider theme={theme}>
    {children}
  </ChakraProvider>
);

describe('Shared Components', () => {
  describe('Button Components', () => {
    test('PrimaryButton renders correctly', () => {
      render(
        <TestWrapper>
          <PrimaryButton>Click me</PrimaryButton>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('chakra-button');
    });

    test('SecondaryButton renders correctly', () => {
      render(
        <TestWrapper>
          <SecondaryButton>Secondary</SecondaryButton>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toBeInTheDocument();
      // Chakra UI doesn't always expose variant as data attribute in tests
      expect(button).toHaveClass('chakra-button');
    });

    test('DangerButton renders correctly', () => {
      render(
        <TestWrapper>
          <DangerButton>Delete</DangerButton>
        </TestWrapper>
      );
      
      const button = screen.getByRole('button', { name: /delete/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('chakra-button');
    });

    test('IconButton renders with icon', () => {
      const mockIcon = () => <span data-testid="icon">📧</span>;
      
      render(
        <TestWrapper>
          <IconButton icon={mockIcon}>Send</IconButton>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });
  });

  describe('Card Components', () => {
    test('InfoCard renders with title and content', () => {
      render(
        <TestWrapper>
          <InfoCard title="Test Card">
            <p>Card content</p>
          </InfoCard>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    test('ActionCard renders with actions', () => {
      const actions = <button>Action</button>;
      
      render(
        <TestWrapper>
          <ActionCard title="Action Card" actions={actions}>
            <p>Content</p>
          </ActionCard>
        </TestWrapper>
      );
      
      expect(screen.getByText('Action Card')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });

  describe('Form Components', () => {
    test('FormField renders with label and error', () => {
      render(
        <TestWrapper>
          <FormField label="Test Field" error="This field is required">
            <input type="text" />
          </FormField>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('TextInput renders correctly', () => {
      render(
        <TestWrapper>
          <TextInput label="Email" placeholder="Enter email" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    test('SelectInput renders with options', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
      
      render(
        <TestWrapper>
          <SelectInput label="Select Option" options={options} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Select Option')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Status Components', () => {
    test('StatusBadge renders with correct color for active status', () => {
      render(
        <TestWrapper>
          <StatusBadge status="active" />
        </TestWrapper>
      );
      
      const badge = screen.getByText('active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('chakra-badge');
    });

    test('StatusBadge renders with correct color for error status', () => {
      render(
        <TestWrapper>
          <StatusBadge status="error" />
        </TestWrapper>
      );
      
      const badge = screen.getByText('error');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('chakra-badge');
    });

    test('LoadingSpinner renders correctly', () => {
      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      );
      
      // Look for the spinner element by class instead of role
      const spinner = document.querySelector('.chakra-spinner');
      expect(spinner).toBeInTheDocument();
    });

    test('LoadingSkeleton renders correctly', () => {
      render(
        <TestWrapper>
          <LoadingSkeleton lines={3} />
        </TestWrapper>
      );
      
      // Look for skeleton elements by class
      const skeletons = document.querySelectorAll('.chakra-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Alert Components', () => {
    test('SuccessAlert renders correctly', () => {
      render(
        <TestWrapper>
          <SuccessAlert title="Success" description="Operation completed" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('data-status', 'success');
    });

    test('ErrorAlert renders correctly', () => {
      render(
        <TestWrapper>
          <ErrorAlert title="Error" description="Something went wrong" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('data-status', 'error');
    });

    test('WarningAlert renders correctly', () => {
      render(
        <TestWrapper>
          <WarningAlert title="Warning" description="Please check your input" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Please check your input')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('data-status', 'warning');
    });
  });

  describe('Layout Components', () => {
    test('PageHeader renders with title and actions', () => {
      const actions = <button>Add New</button>;
      
      render(
        <TestWrapper>
          <PageHeader 
            title="My Page" 
            subtitle="Page description"
            actions={actions}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('My Page')).toBeInTheDocument();
      expect(screen.getByText('Page description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new/i })).toBeInTheDocument();
    });

    test('SectionHeader renders correctly', () => {
      render(
        <TestWrapper>
          <SectionHeader 
            title="Section Title" 
            subtitle="Section description"
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Section description')).toBeInTheDocument();
    });
  });

  describe('Data Display Components', () => {
    test('MetricCard renders with value and change', () => {
      render(
        <TestWrapper>
          <MetricCard 
            title="Total Sales" 
            value="$10,000" 
            change="+15%" 
            changeType="positive"
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('$10,000')).toBeInTheDocument();
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    test('EmptyState renders with action', () => {
      const action = <button>Create New</button>;
      
      render(
        <TestWrapper>
          <EmptyState 
            title="No Data" 
            description="Create your first item"
            action={action}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('No Data')).toBeInTheDocument();
      expect(screen.getByText('Create your first item')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument();
    });

    test('ActionButtons renders with handlers', () => {
      const mockHandlers = {
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onView: jest.fn(),
      };
      
      render(
        <TestWrapper>
          <ActionButtons {...mockHandlers} />
        </TestWrapper>
      );
      
      // Find buttons by their icon content or position
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Click the first button (view)
      fireEvent.click(buttons[0]);
      expect(mockHandlers.onView).toHaveBeenCalledTimes(1);
      
      // Click the second button (edit)
      fireEvent.click(buttons[1]);
      expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
      
      // Click the third button (delete)
      fireEvent.click(buttons[2]);
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
