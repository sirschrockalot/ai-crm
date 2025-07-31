import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import ProfileForm from './ProfileForm';

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}));

describe('ProfileForm', () => {
  const mockOnSubmit = jest.fn();
  const mockForm = {
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    formState: { errors: {} },
    watch: jest.fn(() => 'test@example.com'),
  };

  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue(mockForm);
    mockOnSubmit.mockClear();
  });

  it('renders profile form fields', () => {
    render(
      <ProfileForm 
        form={mockForm as any} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
  });

  it('shows email field as disabled', () => {
    render(
      <ProfileForm 
        form={mockForm as any} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );

    const emailField = screen.getByLabelText(/email address/i);
    expect(emailField).toBeDisabled();
  });

  it('displays validation errors for name field', () => {
    const formWithErrors = {
      ...mockForm,
      formState: { 
        errors: { 
          name: { 
            type: 'required', 
            message: 'Name is required' 
          } 
        } 
      },
    };

    render(
      <ProfileForm 
        form={formWithErrors as any} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    render(
      <ProfileForm 
        form={mockForm as any} 
        onSubmit={mockOnSubmit} 
        isLoading={true} 
      />
    );

    const submitButton = screen.getByRole('button', { name: /updating/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Updating...');
  });

  it('calls onSubmit when form is submitted', async () => {
    render(
      <ProfileForm 
        form={mockForm as any} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );

    const submitButton = screen.getByRole('button', { name: /update profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('registers form fields with react-hook-form', () => {
    render(
      <ProfileForm 
        form={mockForm as any} 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );

    expect(mockForm.register).toHaveBeenCalledWith('name', expect.any(Object));
    expect(mockForm.register).toHaveBeenCalledWith('phone', expect.any(Object));
  });
}); 