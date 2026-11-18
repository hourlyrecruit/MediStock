import { addMonths, format, parseISO, startOfMonth, subMonths } from 'date-fns';
import type {
  CategorySlice,
  InventoryState,
  MedicineCategory,
  MonthlyAddition,
  TransactionType,
} from '@/data/types';
import { memoizeByRef, stateKey } from './memo';
import { selectMedicineViews } from './stock';

const ADDITION_TYPES: readonly TransactionType[] = [
  'STOCK_IN',
  'BATCH_CREATED',
  'ADJUSTMENT_INCREASE',
];

const categoryNames = memoizeByRef(
  (reference: InventoryState['reference']): MedicineCategory[] =>
    reference.categories.map((category) => category.name),
  (reference) => [reference],
);

export function selectCategoryNames(state: InventoryState): MedicineCategory[] {
  return categoryNames(state.reference);
}

export const selectCategoryDistribution = memoizeByRef(
  (state: InventoryState, today: Date): CategorySlice[] => {
    const views = selectMedicineViews(state, today);
    return selectCategoryNames(state)
      .map((category) => {
        const inCategory = views.filter((view) => view.category === category);
        return {
          category,
          medicines: inCategory.length,
          usableUnits: inCategory.reduce((sum, view) => sum + view.stock.usable, 0),
        };
      })
      .filter((slice) => slice.medicines > 0);
  },
  (state, today) => [...stateKey(state, today), state.reference],
);

const monthlyAdditions = memoizeByRef(
  (state: InventoryState, today: Date, count: number): MonthlyAddition[] => {
    const first = startOfMonth(subMonths(today, count - 1));
    const buckets = new Map<string, MonthlyAddition>();
    for (let index = 0; index < count; index += 1) {
      const month = addMonths(first, index);
      const key = format(month, 'yyyy-MM');
      buckets.set(key, { month: key, label: format(month, 'MMM'), units: 0 });
    }
    for (const tx of state.transactions) {
      if (!ADDITION_TYPES.includes(tx.type)) continue;
      const bucket = buckets.get(format(parseISO(tx.date), 'yyyy-MM'));
      if (bucket) bucket.units += tx.quantityChange;
    }
    return [...buckets.values()];
  },
  (state, today, count) => [state.transactions, today.getTime(), count],
);

export function selectMonthlyAdditions(
  state: InventoryState,
  today: Date,
  months = 6,
): MonthlyAddition[] {
  return monthlyAdditions(state, today, months);
}
