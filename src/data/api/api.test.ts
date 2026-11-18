import { demoInventory, demoUser } from '@/data/testing/demo';
import { FIXED_TODAY } from '@/data/testing/fixtures';
import { emptyInventory, useInventoryStore } from '@/data/store/inventoryStore';
import { useSessionStore } from '@/data/store/sessionStore';
import { inventoryActions } from '@/data/actions';
import { assembleInventory } from './assemble';
import { apiConfig } from './config';
import { onSyncError } from './sync';
import { httpTransport, setTransport, type ApiRequest } from './client';
import { endpoints } from './endpoints';
import { ApiError } from './errors';
import { inventoryApi } from './inventoryApi';
import { fetchInventory, loadAppData } from './loader';
import { mockTransport } from './mock/server';
import { offsetDays, rebasePayload } from './mock/rebase';

function resetSession() {
  useSessionStore.setState({ status: 'idle', user: null, error: null });
  useInventoryStore.setState(emptyInventory(), true);
}

describe('mock transport', () => {
  afterEach(() => vi.useRealTimers());

  it('serves every read endpoint from the JSON fixtures', async () => {
    for (const path of [
      endpoints.me,
      endpoints.referenceData,
      endpoints.settings,
      endpoints.medicines,
      endpoints.batches,
      endpoints.transactions,
    ]) {
      const payload = await mockTransport({ method: 'GET', path });
      expect(payload).toHaveProperty('data');
    }
  });

  it('rejects unknown paths', async () => {
    await expect(mockTransport({ method: 'GET', path: '/nope' })).rejects.toBeInstanceOf(ApiError);
  });

  it('rebases fixture dates so the demo stays current', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 10, 9));
    const state = await fetchInventory();
    expect(state).toEqual(demoInventory(new Date(2026, 10, 10)));
    expect(state.batches.bat_01?.expiryDate).toBe('2026-11-09');
  });

  it('shifts date-only and date-time fields by whole days', () => {
    expect(offsetDays('2026-10-31', new Date(2026, 10, 2, 23))).toBe(2);
    const shifted = rebasePayload(
      '/batches',
      { data: [{ expiryDate: '2026-10-31', createdAt: '2026-10-01T10:00:00.000Z', id: 'b' }] },
      2,
    ) as { data: Record<string, string>[] };
    expect(shifted.data[0]?.expiryDate).toBe('2026-11-02');
    expect(shifted.data[0]?.createdAt).toBe('2026-10-03T10:00:00.000Z');
    expect(shifted.data[0]?.id).toBe('b');
  });
});

describe('http transport', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends JSON and unwraps the data envelope', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ data: { id: 'x' } }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const request: ApiRequest = { method: 'PATCH', path: '/settings', body: { a: 1 } };
    await expect(httpTransport(request)).resolves.toEqual({ data: { id: 'x' } });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe('PATCH');
    expect(init.body).toBe('{"a":1}');
  });

  it('maps error bodies to ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: { code: 'NEGATIVE_STOCK', message: 'Only 3 left', field: 'quantity' },
            }),
            { status: 409 },
          ),
      ),
    );
    await expect(httpTransport({ method: 'POST', path: '/x' })).rejects.toMatchObject({
      status: 409,
      code: 'NEGATIVE_STOCK',
      message: 'Only 3 left',
      field: 'quantity',
    });
  });

  it('reports network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('offline'))),
    );
    await expect(httpTransport({ method: 'GET', path: '/me' })).rejects.toMatchObject({
      code: 'NETWORK',
    });
  });

  it('treats 204 as an empty envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await expect(httpTransport({ method: 'DELETE', path: '/medicines/a' })).resolves.toEqual({
      data: null,
    });
  });
});

describe('typed api', () => {
  it('validates response shapes', async () => {
    const restore = setTransport(async () => ({ data: [{ id: 'broken' }] }));
    try {
      await expect(inventoryApi.listMedicines()).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
      });
      await expect(inventoryApi.getSettings()).rejects.toBeInstanceOf(ApiError);
    } finally {
      restore();
    }
  });

  it('rejects payloads without a data envelope', async () => {
    const restore = setTransport(async () => [{ id: 'x' }]);
    try {
      await expect(inventoryApi.getCurrentUser()).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
      });
    } finally {
      restore();
    }
  });

  it('refuses inconsistent inventories', () => {
    const state = demoInventory(FIXED_TODAY);
    const batches = Object.values(state.batches).map((batch) => ({ ...batch, quantity: 1 }));
    expect(() =>
      assembleInventory(
        {
          medicines: Object.values(state.medicines),
          batches,
          transactions: state.transactions,
          settings: state.settings,
          reference: state.reference,
        },
        FIXED_TODAY,
      ),
    ).toThrow(ApiError);
  });
});

describe('loadAppData', () => {
  beforeEach(resetSession);
  afterEach(resetSession);

  it('loads the user and inventory once', async () => {
    const calls: string[] = [];
    const restore = setTransport(async (request) => {
      calls.push(request.path);
      return mockTransport(request);
    });
    try {
      await Promise.all([loadAppData(), loadAppData()]);
      await loadAppData();
      expect(useSessionStore.getState()).toMatchObject({ status: 'ready', user: demoUser() });
      expect(Object.keys(useInventoryStore.getState().medicines)).toHaveLength(25);
      expect(calls.filter((path) => path === endpoints.medicines)).toHaveLength(1);
    } finally {
      restore();
    }
  });

  it('records failures', async () => {
    const restore = setTransport(async () => {
      throw new ApiError(500, 'Server down');
    });
    try {
      await expect(loadAppData()).rejects.toThrow('Server down');
      expect(useSessionStore.getState()).toMatchObject({ status: 'error', error: 'Server down' });
    } finally {
      restore();
    }
  });
});

describe('mutation sync in http mode', () => {
  beforeEach(() => {
    apiConfig.mode = 'http';
    useInventoryStore.setState(demoInventory(FIXED_TODAY), true);
    useSessionStore.setState({ status: 'ready', user: demoUser(), error: null });
  });
  afterEach(() => {
    apiConfig.mode = 'mock';
    resetSession();
  });

  it('posts commands and reconciles the server copy', async () => {
    const requests: ApiRequest[] = [];
    const restore = setTransport(async (request) => {
      requests.push(request);
      const body = request.body as { pharmacyName: string; expiryAlertDays: number };
      return { data: { ...body, pharmacyName: `${body.pharmacyName} HQ`, currency: 'INR' } };
    });
    try {
      const result = inventoryActions.updateSettings({ pharmacyName: 'Sync', expiryAlertDays: 20 });
      expect(result.ok).toBe(true);
      expect(useInventoryStore.getState().settings.pharmacyName).toBe('Sync');
      await vi.waitFor(() =>
        expect(useInventoryStore.getState().settings.pharmacyName).toBe('Sync HQ'),
      );
      expect(requests[0]).toMatchObject({ method: 'PATCH', path: endpoints.settings });
    } finally {
      restore();
    }
  });

  it('sends stock commands with client ids', async () => {
    const requests: ApiRequest[] = [];
    const restore = setTransport(async (request) => {
      requests.push(request);
      return new Promise(() => undefined);
    });
    try {
      const result = inventoryActions.adjustStock({
        batchId: 'bat_03',
        direction: 'DECREASE',
        quantity: 2,
        reason: 'DAMAGED',
      });
      if (!result.ok) throw new Error(result.error.message);
      expect(requests[0]).toEqual({
        method: 'POST',
        path: endpoints.batchAdjustments('bat_03'),
        body: {
          transactionId: result.value.transaction.id,
          direction: 'DECREASE',
          quantity: 2,
          reason: 'DAMAGED',
        },
      });
    } finally {
      restore();
    }
  });

  it('reports failures and reloads from the server', async () => {
    const errors: ApiError[] = [];
    const unsubscribe = onSyncError((error) => errors.push(error));
    const restore = setTransport(async (request) => {
      if (request.method !== 'GET') throw new ApiError(409, 'Rejected', 'NEGATIVE_STOCK');
      return mockTransport(request);
    });
    try {
      inventoryActions.updateSettings({ pharmacyName: 'Rejected name', expiryAlertDays: 30 });
      await vi.waitFor(() => expect(errors).toHaveLength(1));
      expect(errors[0]?.code).toBe('NEGATIVE_STOCK');
      await vi.waitFor(() =>
        expect(useInventoryStore.getState().settings.pharmacyName).toBe('GreenLeaf Pharmacy'),
      );
    } finally {
      restore();
      unsubscribe();
    }
  });
});
