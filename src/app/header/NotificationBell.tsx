import { Link } from 'react-router';
import { AlarmClock, Bell, CircleX, Clock, TrendingDown, type LucideIcon } from 'lucide-react';
import { selectNotifications, useInventory, type NotificationKind } from '@/data';
import { EmptyState, Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/design-system';
import { cn } from '@/shared/cn';

const KIND: Record<NotificationKind, { icon: LucideIcon; tone: string; label: string }> = {
  EXPIRES_TODAY: { icon: AlarmClock, tone: 'text-urgent bg-urgent-soft', label: 'Expires today' },
  EXPIRED: { icon: CircleX, tone: 'text-danger bg-danger-soft', label: 'Expired' },
  LOW_STOCK: { icon: TrendingDown, tone: 'text-warning bg-warning-soft', label: 'Low stock' },
  EXPIRING_SOON: { icon: Clock, tone: 'text-warning bg-warning-soft', label: 'Expiring soon' },
};

export function NotificationBell() {
  const { items, count } = useInventory(selectNotifications);
  const label = count === 0 ? 'Notifications, none' : `Notifications, ${count} alerts`;

  return (
    <Popover>
      <PopoverTrigger>
        <button
          type="button"
          aria-label={label}
          className="focus-ring text-fg-muted hover:bg-surface-muted hover:text-fg relative grid size-11 place-items-center rounded-md transition-colors active:scale-[0.97] motion-safe:hover:[&>svg]:scale-110 motion-safe:active:[&>svg]:scale-95"
        >
          <Bell aria-hidden className="size-5" strokeWidth={1.75} />
          {count > 0 && (
            <span className="tabular bg-danger text-bg absolute top-1.5 right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] leading-none font-semibold">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Inventory alerts" className="w-[min(92vw,380px)] p-0">
        <div className="border-border-subtle flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Inventory alerts</p>
          <span className="tabular text-fg-muted text-xs">{count} open</span>
        </div>
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Bell}
              title="All clear"
              description="No stock or expiry alerts right now."
            />
          </div>
        ) : (
          <ul className="max-h-[60vh] overflow-y-auto p-1.5">
            {items.map((item) => {
              const kind = KIND[item.kind];
              const Icon = kind.icon;
              return (
                <li key={item.id}>
                  <PopoverClose>
                    <Link
                      to={item.href}
                      className="focus-ring hover:bg-surface-muted flex items-start gap-3 rounded-md px-2.5 py-2.5 transition-colors"
                    >
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-sm',
                          kind.tone,
                        )}
                      >
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="text-fg-muted block truncate text-xs">
                          <span className="sr-only">{kind.label}: </span>
                          {item.detail}
                        </span>
                      </span>
                    </Link>
                  </PopoverClose>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
