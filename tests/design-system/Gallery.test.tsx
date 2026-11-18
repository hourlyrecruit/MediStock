import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DesignSystemGallery } from '@/design-system/Gallery';
import { getPageItems } from '@/design-system';
import { renderWithRouter } from '../render';

describe('DesignSystemGallery', () => {
  it('renders every section without crashing', () => {
    renderWithRouter(<DesignSystemGallery />, { path: '/dev/ui', initialEntry: '/dev/ui' });
    expect(screen.getByRole('heading', { level: 1, name: 'Design system' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Demo medicines' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Stock filter' })).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });
});

describe('getPageItems', () => {
  it('lists every page when there are few', () => {
    expect(getPageItems(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('adds ellipses around the current window', () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
    expect(getPageItems(10, 20)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]);
    expect(getPageItems(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20]);
  });
});
