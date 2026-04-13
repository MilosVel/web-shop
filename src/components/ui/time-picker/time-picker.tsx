import { useMemo } from 'react';
import type { Control, FieldError, FieldValues } from 'react-hook-form';

import { Select } from '@/components/ui/form/select';
import { generateTimeOptions } from '@/utils/format-time';
import { cn } from '@/utils/theme';

type TimePickerProps<T extends FieldValues> = {
  control: Control<T>;
  error?: FieldError;
  name: string;
  labelText: string;
  timeInterval: number;
  placeholder: string;
  onChange?: ((value: string | string[]) => void) | undefined;
  maxMenuHeight?: number;
  isClearable?: boolean;
  className?: string;
};

export function TimePicker<T extends FieldValues>({
  error,
  control,
  name,
  labelText,
  timeInterval,
  placeholder,
  onChange,
  maxMenuHeight,
  isClearable = false,
  className,
}: TimePickerProps<T>) {
  const timeOptions = useMemo(() => {
    return generateTimeOptions(timeInterval);
  }, [timeInterval]);

  return (
    <Select
      error={error}
      name={name}
      control={control}
      label={labelText}
      placeholder={placeholder}
      options={timeOptions}
      className={cn('py-[11px]', className)}
      onChange={onChange}
      maxMenuHeight={maxMenuHeight}
      isClearable={isClearable}
    />
  );
}
