import { useCallback, useState } from 'react';
import type {
  Control,
  FieldError,
  FieldValues,
  Path,
  UseFormSetValue,
} from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import { SelectComponent } from '@/components/ui/form/select/select';
import type { SelectOption } from '@/types';
import {
  combineTimeComponents,
  generateHoursOptions,
  generateMinutesOptions,
  parseTimeToComponents,
} from '@/utils/format-time';
import { cn } from '@/utils/theme';

type FullTimePickerProps<T extends FieldValues> = {
  control: Control<T>;
  error?: FieldError;
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  maxMenuHeight?: number;
  isClearable?: boolean;
  className?: string;
  title?: string;
};

const HOURS_OPTIONS: SelectOption[] = generateHoursOptions(1, 12).map(
  (option) => ({
    value: option.value,
    label: option.value,
  }),
);

const MINUTES_OPTIONS: SelectOption[] = generateMinutesOptions(1, false).map(
  (option) => ({
    value: option.value.padStart(2, '0'),
    label: option.value.padStart(2, '0'),
  }),
);

const PERIOD_OPTIONS: SelectOption[] = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

export function FullTimePicker<T extends FieldValues>({
  error,
  control,
  name,
  setValue,
  maxMenuHeight,
  isClearable = false,
  className,
  title,
}: FullTimePickerProps<T>) {
  const mainFieldValue = useWatch({ control, name });

  const [time, setTime] = useState(() => {
    if (mainFieldValue) {
      return parseTimeToComponents(mainFieldValue);
    }
    return { hour: '', minute: '', period: '' };
  });

  const handleComponentChange = useCallback(
    (componentType: 'hour' | 'minute' | 'period', value: string) => {
      setTime((prevTime) => ({ ...prevTime, [componentType]: value }));

      const newTime = { ...time, [componentType]: value };

      const newTimeValue = combineTimeComponents(
        newTime.hour,
        newTime.minute,
        newTime.period,
      );

      if (newTimeValue) {
        setValue(name, newTimeValue as T[Path<T>], {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    },
    [time, name, setValue],
  );

  return (
    <div className={cn(className)}>
      {title && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 [&>*]:min-w-0 [&>*]:flex-1">
        <SelectComponent
          options={HOURS_OPTIONS}
          className="py-[9px]"
          placeholder="HH"
          valueId={time.hour}
          maxMenuHeight={maxMenuHeight}
          isClearable={isClearable}
          onChange={(value) => handleComponentChange('hour', value as string)}
          useMinWidth={false}
        />

        <SelectComponent
          options={MINUTES_OPTIONS}
          className="py-[9px]"
          placeholder="MM"
          valueId={time.minute}
          maxMenuHeight={maxMenuHeight}
          isClearable={isClearable}
          onChange={(value) => handleComponentChange('minute', value as string)}
          useMinWidth={false}
        />

        <SelectComponent
          options={PERIOD_OPTIONS}
          className="py-[9px]"
          placeholder="AM/PM"
          valueId={time.period}
          maxMenuHeight={maxMenuHeight}
          isClearable={isClearable}
          onChange={(value) => handleComponentChange('period', value as string)}
          useMinWidth={false}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}
