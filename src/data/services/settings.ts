import type { InventoryState, Result, Settings } from '@/data/types';
import { ok, validationError } from './result';
import { settingsSchema } from './schemas';
import type { SettingsInput } from './schemas';

export function updateSettings(
  state: InventoryState,
  input: SettingsInput,
  _now?: Date,
): Result<{ state: InventoryState; settings: Settings }> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const settings: Settings = { ...state.settings, ...parsed.data };
  return ok({ state: { ...state, settings }, settings });
}
