import { useState } from 'react';
import { cn } from '@/shared/cn';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-12 text-base' };

export function initialsOf(name: string) {
  const words = name
    .replace(/^(dr|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        'border-border-subtle bg-primary-tint text-primary-press dark:text-primary relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border font-semibold select-none',
        sizes[size],
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <>
          <span aria-hidden>{initialsOf(name)}</span>
          <span className="sr-only">{name}</span>
        </>
      )}
    </span>
  );
}
