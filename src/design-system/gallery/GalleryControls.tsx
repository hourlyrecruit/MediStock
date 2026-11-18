import { useState } from 'react';
import { ArrowRight, Download, Plus, Trash2 } from 'lucide-react';
import { formatINR } from '@/shared/format';
import { Magnetic } from '../motion/Magnetic';
import {
  Avatar,
  Badge,
  Button,
  DateInput,
  ExpiryBadge,
  Field,
  IconButton,
  Input,
  Kbd,
  NumberInput,
  ProgressBar,
  SearchInput,
  SegmentedControl,
  Select,
  Spinner,
  StockLevelBar,
  Tabs,
  Textarea,
  TONES,
  TransactionTypeBadge,
} from '../primitives';
import { EXPIRY_STATUSES, TRANSACTION_TYPES } from '@/data/types';
import { useCategories } from '@/data/hooks';
import { GallerySection } from './GallerySection';

const expiryDays = { VALID: 142, EXPIRING_SOON: 12, EXPIRES_TODAY: 0, EXPIRED: -4 } as const;

export function GalleryButtons() {
  const [loading, setLoading] = useState(false);
  return (
    <GallerySection title="Buttons">
      <div className="flex flex-wrap items-center gap-3">
        <Button leadingIcon={<Plus className="size-4" />}>Add medicine</Button>
        <Button variant="secondary" leadingIcon={<Download className="size-4" />}>
          Export CSV
        </Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="subtle" trailingIcon={<ArrowRight className="size-4" />}>
          View all
        </Button>
        <Button variant="danger" leadingIcon={<Trash2 className="size-4" />}>
          Delete
        </Button>
        <Button disabled>Disabled</Button>
        <Button
          loading={loading}
          onClick={() => {
            setLoading(true);
            window.setTimeout(() => setLoading(false), 1500);
          }}
        >
          Save changes
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <IconButton aria-label="Add" icon={<Plus className="size-4" />} variant="secondary" />
        <IconButton aria-label="Delete" icon={<Trash2 className="size-4" />} />
        <IconButton
          aria-label="Saving"
          icon={<Plus className="size-4" />}
          loading
          variant="secondary"
        />
        <Magnetic>
          <Button size="lg" trailingIcon={<ArrowRight className="size-4" />}>
            Magnetic CTA
          </Button>
        </Magnetic>
        <Spinner label="Loading" />
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
        <Avatar name="Dr. Ananya Rao" />
        <Avatar name="Vikram Shah" size="sm" />
      </div>
    </GallerySection>
  );
}

export function GalleryBadges() {
  const [status, setStatus] = useState(0);
  const cycled = EXPIRY_STATUSES[status % EXPIRY_STATUSES.length] ?? 'VALID';
  return (
    <GallerySection title="Badges and progress">
      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
        <Badge tone="primary" variant="solid">
          Solid
        </Badge>
        <Badge tone="info" variant="outline">
          Outline
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {EXPIRY_STATUSES.map((s) => (
          <ExpiryBadge key={s} status={s} daysLeft={expiryDays[s]} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TRANSACTION_TYPES.map((type) => (
          <TransactionTypeBadge key={type} type={type} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <ExpiryBadge status={cycled} daysLeft={expiryDays[cycled]} />
        <Button size="sm" variant="secondary" onClick={() => setStatus((n) => n + 1)}>
          Change status (pulse)
        </Button>
      </div>
      <div className="grid max-w-md gap-3">
        <ProgressBar label="Usable" value={82} />
        <ProgressBar label="Warning" value={45} size="md" />
        <StockLevelBar stock={6} minStockLevel={20} showValue />
        <StockLevelBar stock={0} minStockLevel={20} showValue />
        <StockLevelBar stock={64} minStockLevel={20} showValue />
      </div>
    </GallerySection>
  );
}

export function GalleryForms() {
  const [segment, setSegment] = useState<'all' | 'low' | 'expired'>('all');
  const [search, setSearch] = useState('');
  const categories = useCategories();
  return (
    <GallerySection title="Form controls">
      <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
        <Field label="Medicine name" hint="As printed on the strip." required>
          <Input placeholder="Paracetamol 500 mg" />
        </Field>
        <Field label="Unit price" error="Price must be greater than zero">
          <NumberInput prefix="₹" decimal defaultValue={0} />
        </Field>
        <Field label="Category">
          <Select
            placeholder="Choose a category"
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </Field>
        <Field label="Expiry date">
          <DateInput />
        </Field>
        <Field label="Remarks" optional className="md:col-span-2">
          <Textarea placeholder="Anything worth noting" />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput placeholder="Search medicines" onDebouncedChange={setSearch} />
        <span className="text-fg-muted text-sm">Debounced: “{search}”</span>
      </div>
      <SegmentedControl
        aria-label="Stock filter"
        value={segment}
        onChange={setSegment}
        options={[
          { value: 'all', label: 'All', count: 38 },
          { value: 'low', label: 'Low stock', count: 6 },
          { value: 'expired', label: 'Expired', count: 3 },
        ]}
      />
      <Tabs
        aria-label="Medicine detail"
        items={[
          {
            value: 'batches',
            label: 'Batches',
            content: <p className="text-fg-muted text-sm">Batch list.</p>,
          },
          {
            value: 'history',
            label: 'History',
            content: <p className="text-fg-muted text-sm">Transactions.</p>,
          },
          {
            value: 'value',
            label: 'Value',
            content: <p className="text-fg-muted text-sm">{formatINR(48250)}</p>,
          },
        ]}
      />
    </GallerySection>
  );
}
