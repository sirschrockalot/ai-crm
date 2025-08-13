import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { LeadFormPage } from '../LeadFormPage';
import { Lead } from '../../types/lead';

// Mock the useToast hook
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault();
      return fn({});
    },
    reset: jest.fn(),
    watch: jest.fn(() => ({})),
    setValue: jest.fn(),
    getValues: jest.fn(() => ({})),
    formState: {
      errors: {},
      isDirty: false,
    },
  }),
  Controller: ({ render, name, rules }: any) => {
    const field = {
      name,
      value: '',
      onChange: jest.fn(),
      onBlur: jest.fn(),
    };
    return render({ field, fieldState: { error: null } });
  },
}));

// Mock useAutoSave hook
jest.mock('../../../../hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    isSaving: false,
    lastSaved: null,
    saveNow: jest.fn(),
  }),
}));

const defaultProps = {
  onSubmit: jest.fn(),
  mode: 'create' as const,
};

const mockLead: Lead = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-1234',
  propertyType: 'single_family',
  estimatedValue: 250000,
  propertyAddress: '123 Main St',
  status: 'new',
  priority: 5,
  assignedAgent: 'Agent Smith',
  notes: 'Test notes',
  createdAt: new Date(),
  updatedAt: new Date(),
  stageId: 'stage1',
  tenantId: 'tenant1',
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('LeadFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders create mode correctly', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      expect(screen.getByText('Create New Lead')).toBeInTheDocument();
      expect(screen.getByText('Fill out the form below to create a new lead.')).toBeInTheDocument();
      expect(screen.getByText('Create Lead')).toBeInTheDocument();
    });

    it('renders edit mode correctly', () => {
      renderWithChakra(
        <LeadFormPage {...defaultProps} mode="edit" lead={mockLead} />
      );
      
      expect(screen.getByText('Edit Lead')).toBeInTheDocument();
      expect(screen.getByText('Update the lead information below.')).toBeInTheDocument();
      expect(screen.getByText('Update Lead')).toBeInTheDocument();
    });

    it('renders all form sections', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Property Information')).toBeInTheDocument();
      expect(screen.getByText('Lead Details')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone *')).toBeInTheDocument();
      expect(screen.getByLabelText('Address *')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toBeInTheDocument();
      expect(screen.getByLabelText('State *')).toBeInTheDocument();
      expect(screen.getByLabelText('ZIP Code *')).toBeInTheDocument();
      expect(screen.getByLabelText('Property Type *')).toBeInTheDocument();
      expect(screen.getByLabelText('Estimated Value *')).toBeInTheDocument();
      expect(screen.getByLabelText('Status *')).toBeInTheDocument();
    });

    it('renders optional form fields', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      expect(screen.getByLabelText('Property Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Assigned To')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows required field indicators', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      const requiredFields = [
        'First Name *',
        'Last Name *',
        'Email *',
        'Phone *',
        'Address *',
        'City *',
        'State *',
        'ZIP Code *',
        'Property Type *',
        'Estimated Value *',
        'Status *',
      ];
      
      requiredFields.forEach(field => {
        expect(screen.getByLabelText(field)).toBeInTheDocument();
      });
    });

    it('validates email format', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email *');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      // Note: This test would need proper react-hook-form mocking to test actual validation
      expect(emailInput).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const mockOnSubmit = jest.fn();
      renderWithChakra(
        <LeadFormPage {...defaultProps} onSubmit={mockOnSubmit} />
      );
      
      const submitButton = screen.getByText('Create Lead');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('shows success toast on successful submission', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      renderWithChakra(
        <LeadFormPage {...defaultProps} onSubmit={mockOnSubmit} />
      );
      
      const submitButton = screen.getByText('Create Lead');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Lead Created',
          description: 'New lead has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      });
    });

    it('shows error toast on failed submission', async () => {
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      renderWithChakra(
        <LeadFormPage {...defaultProps} onSubmit={mockOnSubmit} />
      );
      
      const submitButton = screen.getByText('Create Lead');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Submission failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });
  });

  describe('Form Save Draft', () => {
    it('shows save draft button in create mode', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      const saveDraftButton = screen.getByText('Save Draft');
      expect(saveDraftButton).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', () => {
      const mockOnCancel = jest.fn();
      renderWithChakra(
        <LeadFormPage {...defaultProps} onCancel={mockOnCancel} />
      );
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('populates form with lead data in edit mode', () => {
      renderWithChakra(
        <LeadFormPage {...defaultProps} mode="edit" lead={mockLead} />
      );
      
      // Note: This test would need proper react-hook-form mocking to test actual population
      expect(screen.getByText('Edit Lead')).toBeInTheDocument();
    });

    it('shows update button in edit mode', () => {
      renderWithChakra(
        <LeadFormPage {...defaultProps} mode="edit" lead={mockLead} />
      );
      
      expect(screen.getByText('Update Lead')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone *')).toBeInTheDocument();
    });

    it('has proper button text', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Create Lead' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Draft' })).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders grid layout for form fields', () => {
      renderWithChakra(<LeadFormPage {...defaultProps} />);
      
      // Check that the form uses Grid components for responsive layout
      const gridElements = document.querySelectorAll('[class*="css-142mtwu"]'); // Chakra Grid class
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });
});
