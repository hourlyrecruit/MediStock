import { useState } from 'react';
import {
  Archive,
  Command,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Pill,
  Trash2,
} from 'lucide-react';
import {
  Button,
  CommandPalette,
  ConfirmDialog,
  Dialog,
  DialogClose,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
  Field,
  IconButton,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  toast,
  Tooltip,
} from '../primitives';
import { GallerySection } from './GallerySection';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function GalleryOverlays() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <GallerySection title="Overlays and feedback">
      <div className="flex flex-wrap items-center gap-3">
        <Dialog
          trigger={<Button variant="secondary">Open dialog</Button>}
          title="Edit medicine"
          description="Changes apply to every batch of this medicine."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => toast.success('Medicine updated')}>Save</Button>
              </DialogClose>
            </>
          }
        >
          <Field label="Name">
            <Input defaultValue="Paracetamol 500 mg" />
          </Field>
        </Dialog>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Open sheet
        </Button>
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Receive stock"
          description="Add a new batch to inventory."
          footer={<Button onClick={() => setSheetOpen(false)}>Done</Button>}
        >
          <Field label="Batch number">
            <Input placeholder="B-1042" />
          </Field>
        </Sheet>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Confirm dialog
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          tone="danger"
          title="Delete medicine?"
          description="It has no stock history, so it can be removed safely."
          confirmLabel="Delete"
          onConfirm={() => wait(1200)}
        />
        <Dropdown>
          <DropdownTrigger>
            <IconButton
              aria-label="Row actions"
              icon={<MoreHorizontal className="size-4" />}
              variant="secondary"
            />
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Paracetamol 500 mg</DropdownLabel>
            <DropdownItem icon={Pencil}>Edit</DropdownItem>
            <DropdownItem icon={Archive}>Archive</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={Trash2} destructive>
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
        <Popover>
          <PopoverTrigger>
            <Button variant="secondary">Popover</Button>
          </PopoverTrigger>
          <PopoverContent aria-label="Stock rules">
            <p className="text-sm font-medium">Stock rules</p>
            <p className="text-fg-muted mt-1 text-sm">
              Expired batches never count as usable stock.
            </p>
          </PopoverContent>
        </Popover>
        <Tooltip content="Opens the command palette">
          <Button
            variant="secondary"
            leadingIcon={<Command className="size-4" />}
            onClick={() => setPaletteOpen(true)}
          >
            Command palette
          </Button>
        </Tooltip>
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          groups={[
            {
              heading: 'Pages',
              items: [
                { id: 'home', label: 'Welcome', icon: Home, onSelect: () => toast.info('Welcome') },
                {
                  id: 'dash',
                  label: 'Dashboard',
                  icon: LayoutDashboard,
                  hint: 'G D',
                  onSelect: () => toast.info('Dashboard'),
                },
              ],
            },
            {
              heading: 'Medicines',
              items: [
                {
                  id: 'm1',
                  label: 'Paracetamol 500 mg',
                  icon: Pill,
                  hint: '412 units',
                  onSelect: () => toast.info('Paracetamol'),
                },
                {
                  id: 'm2',
                  label: 'Amoxicillin 250 mg',
                  icon: Pill,
                  hint: 'Low stock',
                  onSelect: () => toast.info('Amoxicillin'),
                },
              ],
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => toast.success('Batch saved', { description: 'B-1042 added to stock.' })}
        >
          Success toast
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.error('Could not save', { description: 'Quantity cannot go below zero.' })
          }
        >
          Error toast
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.info('Medicine archived', {
              action: { label: 'Undo', onClick: () => toast.success('Restored') },
            })
          }
        >
          Action toast
        </Button>
      </div>
    </GallerySection>
  );
}
