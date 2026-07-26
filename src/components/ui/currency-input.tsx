'use client';

import { useState, useEffect, useCallback } from 'react';
import { parseCurrencyInput, formatNumberInput } from '@/lib/utils';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}

export default function CurrencyInput({ value, onChange, label, placeholder = '0', id }: CurrencyInputProps) {
  const [display, setDisplay] = useState(value ? formatNumberInput(value) : '');

  useEffect(() => {
    if (value === 0 && display === '') return;
    const parsed = parseCurrencyInput(display);
    if (parsed !== value) {
      setDisplay(value ? formatNumberInput(value) : '');
    }
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10) || 0;
    setDisplay(num ? formatNumberInput(num) : '');
    onChange(num);
  }, [onChange]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium text-sm">
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          className="input-dark pl-10 text-right text-lg font-semibold tabular-nums"
          placeholder={placeholder}
          id={id}
        />
      </div>
    </div>
  );
}
