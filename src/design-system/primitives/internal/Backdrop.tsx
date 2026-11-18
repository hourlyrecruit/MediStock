import * as RadixDialog from '@radix-ui/react-dialog';
import { m } from 'framer-motion';
import { overlay } from '../../motion/variants';

export function Backdrop() {
  return (
    <RadixDialog.Overlay asChild forceMount>
      <m.div
        variants={overlay}
        initial="hidden"
        animate="show"
        exit="exit"
        className="bg-overlay fixed inset-0 z-50"
      />
    </RadixDialog.Overlay>
  );
}
