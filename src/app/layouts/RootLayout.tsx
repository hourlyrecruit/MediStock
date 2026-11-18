import { LazyMotion, MotionConfig } from 'framer-motion';
import { Outlet, ScrollRestoration } from 'react-router';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect } from 'react';
import {
  useApplyMotion,
  useApplyTheme,
  useAutoHideScrollbars,
  useReducedMotion,
} from '@/shared/hooks';
import { AmbientBackground, Toaster, toast } from '@/design-system';
import { onSyncError } from '@/data/api/sync';

const loadFeatures = () => import('@/design-system/motion/features').then((mod) => mod.default);

export function RootLayout() {
  useApplyTheme();
  useApplyMotion();
  useAutoHideScrollbars();
  const reduce = useReducedMotion();
  useEffect(
    () =>
      onSyncError((error) =>
        toast.error('Change not saved', {
          description: `${error.message} Data was reloaded from the server.`,
        }),
      ),
    [],
  );
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
        <Tooltip.Provider delayDuration={300}>
          <AmbientBackground />
          <Outlet />
          <ScrollRestoration />
          <Toaster />
        </Tooltip.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
