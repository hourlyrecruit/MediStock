import {
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/cn';
import { useDebouncedValue } from '@/shared/hooks';
import { durations } from '../../motion/tokens';
import { FieldContext } from '../Field/context';
import { Input, type InputProps } from '../Input/Input';

export interface SearchInputProps extends Omit<
  InputProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'leading' | 'trailing'
> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  delay?: number;
}

export function SearchInput({
  value,
  defaultValue = '',
  onChange,
  onDebouncedChange,
  delay = 250,
  placeholder = 'Search',
  className,
  wrapperClassName,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const field = useContext(FieldContext);
  const [text, setText] = useState(value ?? defaultValue);
  const emitted = useRef(value ?? defaultValue);
  const debounced = useDebouncedValue(text, delay);

  const emit = useEffectEvent((next: string) => onDebouncedChange?.(next));

  useEffect(() => {
    if (value === undefined || value === emitted.current) return;
    emitted.current = value;
    setText(value);
  }, [value]);

  useEffect(() => {
    if (debounced === emitted.current) return;
    emitted.current = debounced;
    emit(debounced);
  }, [debounced]);

  const update = (next: string) => {
    setText(next);
    onChange?.(next);
  };

  const clear = () => {
    update('');
    emitted.current = '';
    onDebouncedChange?.('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape' && text) {
      event.preventDefault();
      event.stopPropagation();
      clear();
    }
  };

  return (
    <Input
      {...props}
      type="search"
      aria-label={props['aria-label'] ?? (field || props.id ? undefined : placeholder)}
      placeholder={placeholder}
      value={text}
      onChange={(event: ChangeEvent<HTMLInputElement>) => update(event.target.value)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      spellCheck={false}
      wrapperClassName={cn('sm:max-w-80', wrapperClassName)}
      className={cn('[&::-webkit-search-cancel-button]:appearance-none', className)}
      leading={<Search aria-hidden className="size-4" />}
      trailing={
        <AnimatePresence initial={false}>
          {text && (
            <m.button
              type="button"
              aria-label="Clear search"
              onClick={clear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: durations.micro }}
              className="focus-ring text-fg-faint hover:bg-surface-muted hover:text-fg grid size-7 place-items-center rounded-full transition-colors pointer-coarse:size-9"
            >
              <X aria-hidden className="size-4" />
            </m.button>
          )}
        </AnimatePresence>
      }
    />
  );
}
