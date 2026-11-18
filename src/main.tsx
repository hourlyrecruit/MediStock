import { createRoot } from 'react-dom/client';
import '@/design-system/tokens/index.css';
import { App } from '@/app/providers';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root is missing');
createRoot(root).render(<App />);
