import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, Input, NumberInput, Select } from '@/design-system';
import { renderWithMotion } from '../render';

describe('Field', () => {
  it('links the label and hint to the control', () => {
    renderWithMotion(
      <Field label="Medicine name" hint="As printed on the strip.">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Medicine name');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('As printed on the strip.');
  });

  it('wires the error message through aria-invalid and aria-describedby', () => {
    renderWithMotion(
      <Field label="Quantity" hint="Whole units only." error="Quantity must be at least 1" required>
        <NumberInput />
      </Field>,
    );
    const input = screen.getByLabelText(/Quantity/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Quantity must be at least 1');
    expect(screen.queryByText('Whole units only.')).not.toBeInTheDocument();
  });

  it('works for selects and keeps caller describedby ids', () => {
    renderWithMotion(
      <>
        <p id="extra">Extra context</p>
        <Field label="Category" error="Pick a category">
          <Select aria-describedby="extra" placeholder="Choose" options={[{ value: 'a', label: 'Analgesics' }]} />
        </Field>
      </>,
    );
    const select = screen.getByLabelText('Category');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Pick a category Extra context');
  });
});
