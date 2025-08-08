import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (field: keyof T) => {
      if (!validationSchema) return;

      try {
        validationSchema.parse(values);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(e => e.path.includes(field as string));
          setErrors(prev => ({
            ...prev,
            [field]: fieldError?.message,
          }));
        }
      }
    },
    [values, validationSchema]
  );

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach(e => {
          const field = e.path[0] as keyof T;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field);
      }
    },
    [touched, validateField]
  );

  const setFieldTouched = useCallback(
    (field: keyof T, touchedValue = true) => {
      setTouched(prev => ({ ...prev, [field]: touchedValue }));
      if (touchedValue) {
        validateField(field);
      }
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
} 