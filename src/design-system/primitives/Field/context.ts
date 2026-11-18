import { createContext, useContext } from 'react';

export interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

interface ControlA11yProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  required?: boolean;
}

export function useFieldControl<P extends ControlA11yProps>(props: P, invalidProp?: boolean) {
  const field = useContext(FieldContext);
  const describedBy =
    [field?.describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const invalid =
    invalidProp ??
    (field?.invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true');
  return {
    id: props.id ?? field?.id,
    'aria-describedby': describedBy,
    'aria-invalid': invalid || undefined,
    required: props.required ?? (field?.required || undefined),
  };
}
