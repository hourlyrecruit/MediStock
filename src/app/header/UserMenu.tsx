import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { LogOut, Settings, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCurrentUser } from '@/data';
import { initialsOf } from '@/shared/initials';

const itemClass =
  'flex h-10 items-center gap-2 rounded-sm px-3 text-sm outline-none data-disabled:text-fg-faint data-highlighted:bg-surface-muted';

export function UserMenu() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const name = user?.name ?? 'Account';
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="focus-ring bg-surface-muted text-fg-muted ring-border-subtle grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ring-1 transition-transform active:scale-95">
        {user ? initialsOf(user.name) : <UserRound aria-hidden className="size-4" />}
        <span className="sr-only"> account menu for {name}</span>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="glass shadow-raised z-50 min-w-56 rounded-lg border p-1.5"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">{name}</p>
            {user?.role ? <p className="text-fg-muted text-xs">{user.role}</p> : null}
          </div>
          <Dropdown.Separator className="bg-border-subtle my-1 h-px" />
          <Dropdown.Item disabled className={itemClass}>
            <UserRound aria-hidden className="size-4" /> Profile
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={() => navigate('/settings')}
            className={`${itemClass} cursor-pointer`}
          >
            <Settings aria-hidden className="size-4" /> Settings
          </Dropdown.Item>
          <Dropdown.Item disabled className={itemClass}>
            <LogOut aria-hidden className="size-4" /> Sign out
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
