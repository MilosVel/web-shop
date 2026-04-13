import {
  type Control,
  Controller,
  type FieldError,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form';
import Select, {
  type ActionMeta,
  type FormatOptionLabelMeta,
  type GroupBase,
  type MenuPlacement,
  type MultiValue,
  type OptionsOrGroups,
  type SingleValue,
} from 'react-select';

import { FieldWrapper } from '@/components/ui/form/field-wrapper';
import { type SelectOption } from '@/types';
import { cn } from '@/utils/theme';

import { selectStyles } from './style';

const {
  controlStyles,
  placeholderStyles,
  selectInputStyles,
  optionsStyle,
  menuStyles,
  valueContainerStyles,
  singleValueStyles,
  multiValueStyles,
  multiValueLabelStyles,
  multiValueRemoveStyles,
  indicatorsContainerStyles,
  clearIndicatorStyles,
  indicatorSeparatorStyles,
  dropdownIndicatorStyles,
  groupHeadingStyles,
  noOptionsMessageStyles,
} = selectStyles;

type SelectComponentProps<T extends FieldValues> = {
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  isMulti?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  placeholder?: string;
  name?: string;
  error?: FieldError | undefined;
  control?: Control<T>;
  label?: string;
  onChange?: (value: string | string[]) => void;
  onClear?: VoidFunction;
  className?: string | undefined;
  formatOptionLabel?:
  | ((
    data: SelectOption | GroupBase<SelectOption>,
    formatOptionLabelMeta: FormatOptionLabelMeta<
      SelectOption | GroupBase<SelectOption>
    >,
  ) => React.ReactNode)
  | undefined;
  valueId?: string;
  maxMenuHeight?: number;
  menuPlacement?: MenuPlacement | undefined;
  onMenuScrollToBottom?: ((event: WheelEvent | TouchEvent) => void) | undefined;
  useMinWidth?: boolean;
};

export function SelectComponent<T extends FieldValues>({
  options,
  isMulti,
  isDisabled,
  isLoading,
  placeholder,
  name,
  error,
  control,
  label,
  onChange,
  onClear,
  className,
  formatOptionLabel,
  valueId,
  isClearable = true,
  maxMenuHeight,
  menuPlacement,
  onMenuScrollToBottom,
  useMinWidth = true,
}: SelectComponentProps<T>) {
  const handleSelectChange = ({
    option,
    controllerOnChange,
    actionCtx,
  }: {
    option:
    | MultiValue<SelectOption | GroupBase<SelectOption>>
    | SingleValue<SelectOption | GroupBase<SelectOption>>;
    controllerOnChange?: (...event: unknown[]) => void;
    actionCtx: ActionMeta<SelectOption | GroupBase<SelectOption>>;
  }) => {
    if (!isMulti) {
      if (actionCtx.action === 'clear') {
        controllerOnChange?.('');
        onClear?.();
      }

      if (option) {
        controllerOnChange?.((option as SelectOption).value);
        onChange?.((option as SelectOption).value);
      }

      return;
    }

    controllerOnChange?.(
      (option as MultiValue<SelectOption>).map((option) => option.value),
    );

    onChange?.(
      (option as MultiValue<SelectOption>).map((option) => option.value),
    );
  };

  const getSelectValue = (controllerValue: PathValue<T, Path<T>>) => {
    if (!controllerValue) return null;

    if (isMulti) {
      return options?.filter((option) => {
        const singleOption = option as SelectOption;

        if (typeof controllerValue === 'number') {
          return +controllerValue === +singleOption.value;
        }

        if (
          Array.isArray(controllerValue) &&
          controllerValue.some(
            (singleControllerValue: string) =>
              singleControllerValue === singleOption.value,
          )
        ) {
          return singleOption.value;
        }

        return (
          controllerValue?.includes(singleOption.value) ||
          controllerValue === +singleOption.value
        );
      });
    }

    return options?.find(
      (option) => (option as SelectOption).value === controllerValue,
    );
  };

  if (control) {
    return (
      <div className="flex flex-col gap-2">
        <Controller
          control={control}
          name={name as Path<T>}
          render={({
            field: {
              value: controllerValue,
              onChange: controllerOnChange,
              ...field
            },
          }) => {
            return (
              <FieldWrapper label={label} error={error}>
                <Select
                  unstyled
                  closeMenuOnSelect={!isMulti}
                  isClearable={isClearable}
                  isSearchable
                  value={getSelectValue(controllerValue)}
                  isDisabled={isDisabled}
                  isMulti={isMulti}
                  isLoading={isLoading}
                  hideSelectedOptions
                  placeholder={placeholder}
                  options={options}
                  noOptionsMessage={() => 'No options found'}
                  maxMenuHeight={maxMenuHeight}
                  menuPlacement={menuPlacement}
                  onChange={(option, actionCtx) =>
                    handleSelectChange({
                      option,
                      controllerOnChange,
                      actionCtx,
                    })
                  }
                  classNames={{
                    control: ({ isFocused, isDisabled }) =>
                      cn(
                        isFocused
                          ? controlStyles.focus
                          : controlStyles.nonFocus,
                        controlStyles.base,
                        {
                          'min-w-[180px]': useMinWidth,
                        },
                        isDisabled && 'opacity-50',
                      ),
                    placeholder: () => placeholderStyles,
                    input: () => cn(selectInputStyles, className),
                    option: () => optionsStyle,
                    menu: () => menuStyles,
                    valueContainer: () => valueContainerStyles,
                    singleValue: ({ isDisabled }) =>
                      cn(singleValueStyles, isDisabled && 'cursor-not-allowed'),
                    multiValue: () => multiValueStyles,
                    multiValueLabel: () => multiValueLabelStyles,
                    multiValueRemove: () => multiValueRemoveStyles,
                    indicatorsContainer: () => indicatorsContainerStyles,
                    clearIndicator: () => clearIndicatorStyles,
                    indicatorSeparator: () => indicatorSeparatorStyles,
                    dropdownIndicator: () => dropdownIndicatorStyles,
                    groupHeading: () => groupHeadingStyles,
                    noOptionsMessage: () => noOptionsMessageStyles,
                  }}
                  formatOptionLabel={formatOptionLabel}
                  onMenuScrollToBottom={onMenuScrollToBottom}
                  {...field}
                />
              </FieldWrapper>
            );
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldWrapper label={label} error={error}>
        <Select
          unstyled
          closeMenuOnSelect={!isMulti}
          isClearable={isClearable}
          isSearchable
          value={options?.find(
            (option) => (option as SelectOption).value === valueId,
          )}
          isDisabled={isDisabled}
          isMulti={isMulti}
          isLoading={isLoading}
          hideSelectedOptions
          placeholder={placeholder}
          options={options}
          noOptionsMessage={() => 'No options found'}
          maxMenuHeight={maxMenuHeight}
          menuPlacement={menuPlacement}
          onChange={(option, actionCtx) =>
            handleSelectChange({ option, actionCtx })
          }
          classNames={{
            control: ({ isFocused, isDisabled }) =>
              cn(
                isFocused ? controlStyles.focus : controlStyles.nonFocus,
                controlStyles.base,
                {
                  'min-w-[180px]': useMinWidth,
                },
                isDisabled && 'opacity-50',
              ),
            placeholder: () => placeholderStyles,
            input: () => cn(selectInputStyles, className),
            option: () => optionsStyle,
            menu: () => menuStyles,
            valueContainer: () => valueContainerStyles,
            singleValue: ({ isDisabled }) =>
              cn(singleValueStyles, isDisabled && 'cursor-not-allowed'),
            multiValue: () => multiValueStyles,
            multiValueLabel: () => multiValueLabelStyles,
            multiValueRemove: () => multiValueRemoveStyles,
            indicatorsContainer: () => indicatorsContainerStyles,
            clearIndicator: () => clearIndicatorStyles,
            indicatorSeparator: () => indicatorSeparatorStyles,
            dropdownIndicator: () => dropdownIndicatorStyles,
            groupHeading: () => groupHeadingStyles,
            noOptionsMessage: () => noOptionsMessageStyles,
          }}
          onMenuScrollToBottom={onMenuScrollToBottom}
          formatOptionLabel={formatOptionLabel}
        />
      </FieldWrapper>
    </div>
  );
}
