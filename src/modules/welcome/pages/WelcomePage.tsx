import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { m } from 'framer-motion';
import { ArrowRight, CalendarClock, Store } from 'lucide-react';
import { Button, buttonBase, buttonSizes, buttonVariants, Magnetic } from '@/design-system';
import { Hero3D } from '@/three';
import { useInventory, useUiStore, type InventoryState } from '@/data';
import { links } from '@/shared/routes';
import { cn } from '@/shared/cn';
import { WelcomeTopBar } from '../components/WelcomeTopBar';
import { HeroBackdrop } from '../components/HeroBackdrop';
import { KpiChips } from '../components/KpiChips';
import { FeatureStrip } from '../components/FeatureStrip';
import { heroItem, heroSequence, sceneReveal } from '../components/motion';

const selectPharmacyName = (state: InventoryState) => state.settings.pharmacyName;

const SCENE_MASK =
  '[mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_78%,transparent_100%)] md:[mask-image:none]';

export function WelcomePage() {
  const pharmacyName = useInventory(selectPharmacyName);
  const markWelcomeSeen = useUiStore((s) => s.markWelcomeSeen);
  const navigate = useNavigate();

  const enterDashboard = useCallback(() => {
    markWelcomeSeen();
    void navigate(links.dashboard());
  }, [markWelcomeSeen, navigate]);

  return (
    <div className="text-fg relative min-h-dvh">
      <WelcomeTopBar />
      <main>
        <section
          aria-labelledby="welcome-title"
          className="relative isolate flex min-h-dvh flex-col overflow-hidden pt-16 md:justify-center md:pt-20"
        >
          <m.div
            variants={sceneReveal}
            initial="hidden"
            animate="show"
            className={cn(
              'relative -z-20 h-[clamp(220px,36svh,340px)] w-full md:absolute md:inset-0 md:h-auto',
              SCENE_MASK,
            )}
          >
            <Hero3D className="absolute inset-0" />
          </m.div>
          <div className="absolute inset-0 -z-10">
            <HeroBackdrop />
          </div>

          <m.div
            variants={heroSequence}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-[1200px] px-4 pb-12 md:px-8 md:pb-0"
          >
            <div className="max-w-[640px] md:w-[52%] md:min-w-[440px]">
              <m.p
                variants={heroItem}
                className="text-fg-muted flex items-center gap-2 text-sm font-medium"
              >
                <Store aria-hidden="true" className="text-primary size-4" strokeWidth={1.75} />
                <span>{pharmacyName}</span>
              </m.p>
              <m.h1
                id="welcome-title"
                variants={heroItem}
                className="md:text-display mt-4 text-2xl font-semibold text-balance"
              >
                Every batch, accounted for.
              </m.h1>
              <m.p
                variants={heroItem}
                className="text-fg-muted mt-4 max-w-[44ch] text-base md:text-lg"
              >
                Track stock batch by batch and catch expiring medicine before it reaches the
                counter.
              </m.p>
              <m.div variants={heroItem} className="mt-8">
                <KpiChips />
              </m.div>
              <m.div
                variants={heroItem}
                className="mt-10 flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3"
              >
                <Magnetic className="block md:inline-block">
                  <Button
                    size="lg"
                    trailingIcon={<ArrowRight className="size-5" />}
                    onClick={enterDashboard}
                    className="w-full md:w-auto"
                  >
                    Enter dashboard
                  </Button>
                </Magnetic>
                <Link
                  to={links.expiry({ status: 'expiring-soon' })}
                  onClick={markWelcomeSeen}
                  className={cn(
                    buttonBase,
                    buttonVariants.ghost,
                    buttonSizes.lg,
                    'active:scale-[0.97]',
                  )}
                >
                  <CalendarClock aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  View expiry alerts
                </Link>
              </m.div>
            </div>
          </m.div>
        </section>
        <FeatureStrip />
      </main>
      <footer className="border-border-subtle border-t">
        <div className="text-fg-faint mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-4 py-8 text-xs md:flex-row md:justify-between md:px-8">
          <p>MediStock for {pharmacyName}</p>
          <p>Your inventory stays on this device.</p>
        </div>
      </footer>
    </div>
  );
}
