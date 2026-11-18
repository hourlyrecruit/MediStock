import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Pill } from 'lucide-react';
import { selectMedicineViews, useInventory, useUiStore } from '@/data';
import { CommandPalette } from '@/design-system/primitives/CommandPalette';
import { navItems } from '../registry';

export function SearchPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const navigate = useNavigate();
  const medicines = useInventory(selectMedicineViews);

  const groups = useMemo(
    () => [
      {
        heading: 'Medicines',
        items: medicines.map((medicine) => ({
          id: medicine.id,
          label: medicine.name,
          hint: `${medicine.genericName} · ${medicine.stock.usable} usable${medicine.isActive ? '' : ' · inactive'}`,
          icon: Pill,
          keywords: [medicine.genericName, medicine.category, medicine.manufacturer],
          onSelect: () => navigate(`/medicines/${medicine.id}`),
        })),
      },
      {
        heading: 'Go to',
        items: navItems.map((item) => ({
          id: `nav-${item.id}`,
          label: item.label,
          icon: item.icon,
          onSelect: () => navigate(item.path),
        })),
      },
    ],
    [medicines, navigate],
  );

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      groups={groups}
      label="Search medicines"
      placeholder="Search medicines by name or generic name…"
    />
  );
}
