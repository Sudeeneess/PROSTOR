import React from 'react';
import { formatFioDisplay, sanitizeFioInput } from '../utils/fioInput';

export interface SellerFioInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

/** Поле ввода ФИО с фильтрацией символов и нормализацией регистра на blur. */
const SellerFioInput: React.FC<SellerFioInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  className,
  placeholder = 'Иванов Иван Иванович',
  required,
  autoComplete = 'name',
}) => {
  return (
    <input
      id={id}
      name={name}
      type="text"
      className={className}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      maxLength={120}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(sanitizeFioInput(e.target.value));
      }}
      onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(formatFioDisplay(e.target.value));
        onBlur?.();
      }}
      disabled={disabled}
    />
  );
};

export default SellerFioInput;
