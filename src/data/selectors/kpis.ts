import type { InventoryState, Kpis } from '@/data/types';
import { memoizeByRef, stateKey } from './memo';
import {
  selectExpired,
  selectExpiresToday,
  selectExpiringSoon,
  selectLowStock,
  selectMedicineViews,
} from './stock';

export const selectKpis = memoizeByRef(
  (state: InventoryState, today: Date): Kpis => {
    const views = selectMedicineViews(state, today);
    const expired = selectExpired(state, today);
    let usableUnits = 0;
    let usableStockValue = 0;
    for (const view of views) {
      usableUnits += view.stock.usable;
      usableStockValue += view.stock.usable * view.unitPrice;
    }
    return {
      totalMedicines: views.length,
      activeMedicines: views.filter((view) => view.isActive).length,
      usableUnits,
      usableStockValue: Math.round(usableStockValue * 100) / 100,
      lowStockCount: selectLowStock(state, today).length,
      expiresTodayCount: selectExpiresToday(state, today).length,
      expiringSoonCount: selectExpiringSoon(state, today).length,
      expiredCount: expired.length,
      expiredUnits: expired.reduce((sum, view) => sum + view.quantity, 0),
    };
  },
  (state, today) => stateKey(state, today),
);
