import React from 'react';
import { Input as ChakraInput, FormControl, FormLabel, FormErrorMessage, InputProps as ChakraInputProps } from '@chakra-ui/react';

export interface InputProps extends Omit<ChakraInputProps, 'type'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  label,
  name,
  ...props
}) => {
  const inputElement = (
    <ChakraInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      name={name}
      isInvalid={!!error}
      {...props}
    />
  );

  if (label) {
    return (
      <FormControl isInvalid={!!error} isRequired={required}>
        <FormLabel>{label}</FormLabel>
        {inputElement}
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }

  return inputElement;
};

export default Input; 