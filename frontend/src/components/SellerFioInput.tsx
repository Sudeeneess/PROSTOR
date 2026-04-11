import React from 'react';
import InputMask from 'react-input-mask';
import { formatFioDisplay, sanitizeFioInput } from '../utils/fioInput';

/** В рантайме есть `formatChars`, в @types/react-input-mask — нет (Props = type alias). */
const InputMaskWithFormatChars = InputMask as React.ComponentType<
  React.ComponentProps<typeof InputMask> & { formatChars?: Record<string, string> }
>;

/** Слоты: фамилия / имя / отчество; пробелы в маске — разделители между частями. */
function buildFioMask(): string {
  const slot = (n: number) => 'a'.repeat(n);
  return `${slot(28)} ${slot(28)} ${slot(32)}`;
}

const FIO_MASK = buildFioMask();

const FIO_FORMAT_CHARS = {
  a: '[А-Яа-яЁёA-Za-z\\-]',
};

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

/**
 * Маска ввода ФИО: три группы букв (фамилия, имя, отчество), дефис внутри части допустим.
 */
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
    <InputMaskWithFormatChars
      mask={FIO_MASK}
      maskChar={null}
      alwaysShowMask={false}
      formatChars={FIO_FORMAT_CHARS}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(sanitizeFioInput(e.target.value));
      }}
      onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(formatFioDisplay(e.target.value));
        onBlur?.();
      }}
      disabled={disabled}
    >
      {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
          {...inputProps}
          id={id}
          name={name}
          type="text"
          className={className}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
      )}
    </InputMaskWithFormatChars>
  );
};

export default SellerFioInput;
