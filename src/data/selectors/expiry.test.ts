import { addDays, format } from 'date-fns';
import { daysUntilExpiry, expiryStatus, isUsable } from './expiry';

const TODAY = new Date(2026, 9, 31);

function batchExpiring(offset: number) {
  return { expiryDate: format(addDays(TODAY, offset), 'yyyy-MM-dd') };
}

describe('daysUntilExpiry', () => {
  it.each([-1, 0, 1, 30, 31, 365])('counts calendar days for offset %i', (offset) => {
    expect(daysUntilExpiry(batchExpiring(offset), TODAY)).toBe(offset);
  });

  it('ignores the time of day', () => {
    const lateToday = new Date(2026, 9, 31, 23, 59);
    expect(daysUntilExpiry(batchExpiring(0), lateToday)).toBe(0);
    expect(daysUntilExpiry(batchExpiring(1), lateToday)).toBe(1);
  });

  it('crosses month and leap-day boundaries', () => {
    const leap = new Date(2028, 1, 29);
    expect(daysUntilExpiry({ expiryDate: '2028-03-01' }, leap)).toBe(1);
    expect(daysUntilExpiry({ expiryDate: '2028-02-28' }, leap)).toBe(-1);
  });
});

describe('expiryStatus', () => {
  it.each([
    [-1, 'EXPIRED'],
    [-400, 'EXPIRED'],
    [0, 'EXPIRES_TODAY'],
    [1, 'EXPIRING_SOON'],
    [30, 'EXPIRING_SOON'],
    [31, 'VALID'],
  ] as const)('daysLeft %i with 30 alert days is %s', (daysLeft, status) => {
    expect(expiryStatus(daysLeft, 30)).toBe(status);
  });

  it('respects a shorter threshold', () => {
    expect(expiryStatus(7, 7)).toBe('EXPIRING_SOON');
    expect(expiryStatus(8, 7)).toBe('VALID');
    expect(expiryStatus(0, 7)).toBe('EXPIRES_TODAY');
  });

  it('respects a longer threshold', () => {
    expect(expiryStatus(31, 60)).toBe('EXPIRING_SOON');
    expect(expiryStatus(60, 60)).toBe('EXPIRING_SOON');
    expect(expiryStatus(61, 60)).toBe('VALID');
  });
});

describe('isUsable', () => {
  it('only rejects expired stock', () => {
    expect(isUsable('EXPIRED')).toBe(false);
    expect(isUsable('EXPIRES_TODAY')).toBe(true);
    expect(isUsable('EXPIRING_SOON')).toBe(true);
    expect(isUsable('VALID')).toBe(true);
  });
});
