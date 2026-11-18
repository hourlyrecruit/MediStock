import type { BatchView, InventoryState, NotificationItem, NotificationKind } from '@/data/types';
import { STATUS_PARAM, links } from '@/shared/routes';
import { memoizeByRef, stateKey } from './memo';
import { selectExpired, selectExpiresToday, selectExpiringSoon, selectLowStock } from './stock';

function units(quantity: number) {
  return `${quantity} ${quantity === 1 ? 'unit' : 'units'}`;
}

function days(count: number) {
  return `${count} ${count === 1 ? 'day' : 'days'}`;
}

function batchItem(
  view: BatchView,
  kind: NotificationKind,
  title: string,
  detail: string,
): NotificationItem {
  return {
    id: `${kind}:${view.id}`,
    kind,
    title,
    detail,
    href: links.expiry({ status: STATUS_PARAM[view.status], q: view.batchNumber }),
  };
}

export const selectNotifications = memoizeByRef(
  (state: InventoryState, today: Date): { items: NotificationItem[]; count: number } => {
    const items: NotificationItem[] = [
      ...selectExpiresToday(state, today).map((view) =>
        batchItem(
          view,
          'EXPIRES_TODAY',
          `${view.medicine.name} expires today`,
          `Batch ${view.batchNumber} · ${units(view.quantity)}`,
        ),
      ),
      ...selectExpired(state, today).map((view) =>
        batchItem(
          view,
          'EXPIRED',
          `${view.medicine.name} has expired`,
          `Batch ${view.batchNumber} · ${units(view.quantity)} · ${days(-view.daysLeft)} ago`,
        ),
      ),
      ...selectLowStock(state, today).map((view): NotificationItem => ({
        id: `LOW_STOCK:${view.id}`,
        kind: 'LOW_STOCK',
        title: `${view.name} is low on stock`,
        detail: `${units(view.stock.usable)} usable · minimum ${view.minStockLevel}`,
        href: links.medicine(view.id),
      })),
      ...selectExpiringSoon(state, today).map((view) =>
        batchItem(
          view,
          'EXPIRING_SOON',
          `${view.medicine.name} expires soon`,
          `Batch ${view.batchNumber} · ${units(view.quantity)} · ${days(view.daysLeft)} left`,
        ),
      ),
    ];
    return { items, count: items.length };
  },
  (state, today) => stateKey(state, today),
);
