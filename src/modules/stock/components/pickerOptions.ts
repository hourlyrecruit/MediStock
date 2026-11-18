import type { BatchView } from '@/data';
import type { SelectOption } from '@/design-system';

export function medicineOptionsFrom(
  batches: readonly BatchView[],
  eligible: (view: BatchView) => boolean,
  emptyLabel = 'no unexpired batches',
): SelectOption[] {
  const byId = new Map<string, { name: string; enabled: boolean }>();
  for (const view of batches) {
    const entry = byId.get(view.medicineId) ?? { name: view.medicine.name, enabled: false };
    entry.enabled ||= eligible(view);
    byId.set(view.medicineId, entry);
  }
  return [...byId.entries()]
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([value, entry]) => ({
      value,
      label: entry.enabled ? entry.name : `${entry.name} (${emptyLabel})`,
      disabled: !entry.enabled,
    }));
}
