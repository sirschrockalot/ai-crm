import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PreferencesForm from './PreferencesForm';

describe('PreferencesForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders preferences form fields', () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        currentPreferences={{}}
      />
    );

    expect(screen.getByText(/theme/i)).toBeInTheDocument();
    expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/default dashboard view/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update preferences/i })).toBeInTheDocument();
  });

  it('displays current preferences when provided', () => {
    const currentPreferences = {
      theme: 'dark',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      default_view: 'leads',
    };

    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        currentPreferences={currentPreferences}
      />
    );

    // Check that dark theme is selected
    expect(screen.getByDisplayValue('dark')).toBeChecked();
    
    // Check notification preferences
    expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/sms notifications/i)).not.toBeChecked();
    expect(screen.getByLabelText(/push notifications/i)).toBeChecked();
    
    // Check default view (select element, not radio)
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('leads');
  });

  it('handles theme change', () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        currentPreferences={{}}
      />
    );

    const darkThemeRadio = screen.getByDisplayValue('dark');
    fireEvent.click(darkThemeRadio);

    expect(darkThemeRadio).toBeChecked();
  });

  it('handles notification preference changes', () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        currentPreferences={{}}
      />
    );

    const emailCheckbox = screen.getByLabelText(/email notifications/i);
    const smsCheckbox = screen.getByLabelText(/sms notifications/i);

    fireEvent.click(emailCheckbox);
    fireEvent.click(smsCheckbox);

    // Email starts as checked, so clicking it makes it unchecked
    expect(emailCheckbox).not.toBeChecked();
    expect(smsCheckbox).toBeChecked();
  });

  it('handles default view change', () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        currentPreferences={{}}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'buyers' } });

    expect(select).toHaveValue('buyers');
  });

  it('shows loading state when submitting', () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={true} 
        currentPreferences={{}}
      />
    );

    const submitButton = screen.getByRole('button', { name: /updating/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Updating...');
  });

  it('calls onSubmit with updated preferences when form is submitted', async () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
        currentPreferences={{}}
      />
    );

    // Change some preferences
    const darkThemeRadio = screen.getByDisplayValue('dark');
    const emailCheckbox = screen.getByLabelText(/email notifications/i);
    const select = screen.getByRole('combobox');

    fireEvent.click(darkThemeRadio);
    fireEvent.click(emailCheckbox);
    fireEvent.change(select, { target: { value: 'buyers' } });

    const submitButton = screen.getByRole('button', { name: /update preferences/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        theme: 'dark',
        notifications: {
          email: false, // Email starts as true, clicking makes it false
          sms: false,
          push: true, // Push starts as true
        },
        default_view: 'buyers',
      });
    });
  });

  it('uses default values when no current preferences provided', () => {
    render(
      <PreferencesForm 
        onSubmit={mockOnSubmit} 
        isLoading={false} 
      />
    );

    // Check default theme (auto)
    expect(screen.getByDisplayValue('auto')).toBeChecked();
    
    // Check default notifications (email and push are true by default, sms is false)
    expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/sms notifications/i)).not.toBeChecked();
    expect(screen.getByLabelText(/push notifications/i)).toBeChecked();
    
    // Check default view (dashboard)
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('dashboard');
  });
}); 