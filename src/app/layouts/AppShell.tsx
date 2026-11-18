import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { Header } from '../header/Header';
import { PageTransition } from '@/design-system/motion';

export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="bg-primary text-primary-fg sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="main"
          className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-6 pb-28 md:px-6 md:pb-10"
        >
          <PageTransition />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
