import { StrictMode } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './router';

const router = createAppRouter();

export function App() {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
