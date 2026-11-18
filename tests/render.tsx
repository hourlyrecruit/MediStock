import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { LazyMotion, MotionConfig, domMax } from 'framer-motion';
import { createMemoryRouter, RouterProvider } from 'react-router';

function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="always">{children}</MotionConfig>
    </LazyMotion>
  );
}

export function renderWithMotion(ui: ReactElement) {
  return render(ui, { wrapper: Providers });
}

export function renderWithRouter(ui: ReactElement, { path = '/', initialEntry = '/' } = {}) {
  const router = createMemoryRouter(
    [
      { path, element: <Providers>{ui}</Providers> },
      { path: '*', element: <p>Elsewhere</p> },
    ],
    { initialEntries: [initialEntry] },
  );
  const result = render(<RouterProvider router={router} />);
  return { ...result, router };
}
