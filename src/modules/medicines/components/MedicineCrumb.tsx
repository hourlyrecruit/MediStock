import { useCallback } from 'react';
import type { Params } from 'react-router';
import { useInventory, type InventoryState } from '@/data';

export function MedicineCrumb({ params }: { params: Params }) {
  const id = params.id ?? '';
  const name = useInventory(
    useCallback((state: InventoryState) => state.medicines[id]?.name, [id]),
  );
  return <>{name ?? 'Not found'}</>;
}
