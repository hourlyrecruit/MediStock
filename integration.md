# MediStock — Backend Integration Guide

The frontend has no hardcoded business data. Everything it displays is loaded through one typed API client (`src/data/api`). Right now that client is served by JSON fixtures. Connecting a real backend means implementing the endpoints below and setting one environment variable. No UI code changes are needed.

---

## 1. How the frontend talks to the API

| Piece | File | Role |
| --- | --- | --- |
| Config | `src/data/api/config.ts` | Reads `VITE_API_BASE_URL`. If it is empty, the app runs in **mock** mode. If it is set, it runs in **http** mode. |
| Endpoints | `src/data/api/endpoints.ts` | Every path the app calls. |
| Transport | `src/data/api/client.ts` | `httpTransport` (real `fetch`) or `mockTransport` (JSON fixtures). It unwraps the `{ "data": … }` envelope and maps errors to `ApiError`. |
| Typed API | `src/data/api/inventoryApi.ts` | One function per endpoint. Every response is validated at runtime. A malformed response is rejected with `INVALID_RESPONSE`. |
| Contracts | `src/data/api/contracts.ts` | Request and response body types for the mutations. |
| Loader | `src/data/api/loader.ts` | `loadAppData()` runs as the root route loader. It fetches all reads in parallel before the first screen renders. |
| Sync | `src/data/api/sync.ts` | Sends mutations to the server after the local optimistic update (see §5). |
| Mock fixtures | `src/data/api/mock/*.json` | The demo dataset, one file per endpoint. |

### Switching to a real backend

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.com/v1
```

- Requests go to `${VITE_API_BASE_URL}${path}`, with `credentials: 'include'` (cookie auth) and `Accept: application/json`. Bodies are sent as `Content-Type: application/json`.
- In http mode, `localStorage` persistence of inventory is **off**. The server is the source of truth.
- The "Demo data" card in Settings is shown only in mock mode.
- The server must allow CORS from the frontend origin, with credentials, if it lives on a different origin.

### Mock mode details

- Each `GET` reads the matching JSON file through a lazy `import()`. Vite emits each file as its own chunk, fetched at runtime.
- `mock/meta.json` holds `referenceDate` (the "today" the fixtures were written for). At load time, the mock shifts every date field by `today − referenceDate` days, so the demo always has expired, expiring and valid batches. **A real backend returns real dates and nothing is shifted.**
- Mutations are not sent anywhere in mock mode. The app state is persisted to `localStorage` (`medistock:inventory`, version 2).

---

## 2. Conventions

### Envelope

Every successful response body is wrapped:

```json
{ "data": <payload> }
```

`204 No Content` is also accepted, and is treated as `{ "data": null }`.

### Errors

Any non-2xx response should return:

```json
{
  "error": {
    "code": "NEGATIVE_STOCK",
    "message": "Only 12 units are available in batch PCM-2510-A",
    "field": "quantity"
  }
}
```

| `code` | HTTP | When |
| --- | --- | --- |
| `VALIDATION` | 400 / 422 | Body fails validation. `field` names the offending input. |
| `NOT_FOUND` | 404 | Unknown medicine or batch id. |
| `NEGATIVE_STOCK` | 409 | A decrease would take a batch below 0. |
| `BATCH_EXPIRED` | 409 | Receiving into, or increasing, an expired batch. |
| `DUPLICATE_BATCH` | 409 | The batch number already exists for this medicine (case-insensitive). |
| `DUPLICATE_MEDICINE` | 409 | The same `name` + `genericName` already exists (case-insensitive, trimmed). |
| `MEDICINE_INACTIVE` | 409 | Adding a batch to an inactive medicine. |
| `MEDICINE_HAS_HISTORY` | 409 | Deleting a medicine that has batches or transactions. |

The client also generates two codes of its own: `NETWORK` (the server can't be reached) and `INVALID_RESPONSE` (the response doesn't match the schema).

### Types and formats

| Type | Format | Example |
| --- | --- | --- |
| `ID` | non-empty string | `"med_01"`, `"bat_3f2c…"` |
| `ISODate` | `yyyy-MM-dd` | `"2026-10-31"` |
| `ISODateTime` | ISO 8601 with offset | `"2026-10-31T05:00:00.000Z"` |
| money | number, ≤ 2 decimals, INR | `32.5` |
| quantity | integer ≥ 0 (units) | `150` |

### Client-generated IDs

New medicines, batches and transactions get their IDs on the client (`<prefix>_<uuid>`, for example `txn_1b4e…`), so the UI can update instantly. **The server must accept and keep the IDs it is given.** That also makes retries idempotent: a repeated request with the same id must not create a duplicate.

---

## 3. Data model

### Medicine

| Field | Type | Rules |
| --- | --- | --- |
| `id` | ID | |
| `name` | string | 2–80 chars |
| `genericName` | string | 2–80 chars |
| `category` | string | must be one of `reference-data.categories[].name` when created or changed |
| `manufacturer` | string | 2–80 chars |
| `unitPrice` | number | > 0, ≤ 100000, ≤ 2 decimals |
| `minStockLevel` | integer | 0–100000 |
| `description` | string | ≤ 500 chars, may be empty |
| `isActive` | boolean | |
| `createdAt` | ISODateTime | set by server |
| `updatedAt` | ISODateTime | set by server |

### Batch

| Field | Type | Rules |
| --- | --- | --- |
| `id` | ID | |
| `medicineId` | ID | → Medicine |
| `batchNumber` | string | 2–30 chars, `[A-Za-z0-9-]`, stored uppercase, unique per medicine |
| `openingQuantity` | integer ≥ 0 | stock the batch held before the transaction history begins (0 for batches created in-app) |
| `quantity` | integer ≥ 0 | current stock. **Must equal `openingQuantity + Σ transactions.quantityChange` for this batch.** |
| `expiryDate` | ISODate | |
| `receivedDate` | ISODate | |
| `createdAt` | ISODateTime | |

### StockTransaction (immutable)

| Field | Type | Rules |
| --- | --- | --- |
| `id` | ID | |
| `medicineId` | ID | must match the batch's medicine |
| `batchId` | ID | → Batch |
| `type` | enum | `BATCH_CREATED` · `STOCK_IN` · `ADJUSTMENT_INCREASE` · `ADJUSTMENT_DECREASE` |
| `quantityChange` | integer | > 0 for every type except `ADJUSTMENT_DECREASE`, which is < 0 |
| `quantityAfter` | integer ≥ 0 | the batch quantity right after this transaction |
| `date` | ISODateTime | |
| `reason` | enum, optional | `DAMAGED` · `EXPIRED_DISPOSED` · `COUNT_CORRECTION` · `RETURNED` · `OTHER` (adjustments only) |
| `remarks` | string, optional | ≤ 200 chars. Required (≥ 3 chars) when `reason = OTHER`. |

### Settings

| Field | Type | Rules |
| --- | --- | --- |
| `pharmacyName` | string | 2–60 chars |
| `currency` | `"INR"` | fixed |
| `expiryAlertDays` | integer | 1–365. Batches expiring within this window count as "Expiring soon". |

### ReferenceData

| Field | Type | Rules |
| --- | --- | --- |
| `categories` | `{ name: string }[]` | at least one. Drives category filters, the medicine form and the category chart, in this order. |

### CurrentUser

| Field | Type |
| --- | --- |
| `id` | ID |
| `name` | string (initials are derived by the UI) |
| `role` | string |
| `email` | string |

### Integrity rules the frontend enforces on load

When the inventory is loaded, it is checked with `assertInvariants`. If the check fails, the app shows an error screen. So the server must guarantee:

1. Every batch references an existing medicine, and every transaction references an existing batch with the same `medicineId`.
2. Batch numbers are unique per medicine (case-insensitive).
3. Walking each batch's transactions in `date` order, starting from `openingQuantity`, every `quantityAfter` equals the running total, never goes below 0, and the final total equals `batch.quantity`.
4. Transaction ids are unique.

Derived values (usable stock, expiry status, low-stock, KPIs, charts, reports) are computed **on the client** from these collections. The backend does not need to provide them.

---

## 4. Endpoints

### Reads (all called once at startup by `loadAppData`)

| Method | Path | Response `data` | Mock fixture |
| --- | --- | --- | --- |
| GET | `/me` | `CurrentUser` | `mock/me.json` |
| GET | `/reference-data` | `ReferenceData` | `mock/reference-data.json` |
| GET | `/settings` | `Settings` | `mock/settings.json` |
| GET | `/medicines` | `Medicine[]` (all, including inactive) | `mock/medicines.json` |
| GET | `/batches` | `Batch[]` (all, including empty and expired) | `mock/batches.json` |
| GET | `/transactions` | `StockTransaction[]` (all, any order; the client sorts by `date`) | `mock/transactions.json` |

These return full collections, because filtering, search, sort and pagination all happen on the client. If the dataset grows large, add server-side pagination later and replace the corresponding loader call.

### Medicines

| Method | Path | Body | Response `data` |
| --- | --- | --- | --- |
| POST | `/medicines` | `CreateMedicineRequest` | `Medicine` (201) |
| PUT | `/medicines/:id` | `UpdateMedicineRequest` | `Medicine` |
| PATCH | `/medicines/:id` | `{ "isActive": boolean }` | `Medicine` |
| DELETE | `/medicines/:id` | — | `null` or 204. Fails with `MEDICINE_HAS_HISTORY` when the medicine has batches or transactions. |

```jsonc
// CreateMedicineRequest (UpdateMedicineRequest is the same without "id")
{
  "id": "med_7c1e…",
  "name": "Paracare 650",
  "genericName": "Paracetamol",
  "category": "Analgesics",
  "manufacturer": "Veridian Pharma",
  "unitPrice": 32.5,
  "minStockLevel": 150,
  "description": "Strip of 15 tablets.",
  "isActive": true
}
```

### Stock (every call creates exactly one immutable transaction)

| Method | Path | Body | Response `data` |
| --- | --- | --- | --- |
| POST | `/batches` | `CreateBatchRequest` | `{ batch, transaction }` (201). Transaction type is `BATCH_CREATED`. |
| POST | `/batches/:batchId/receipts` | `ReceiveStockRequest` | `{ batch, transaction }`. Transaction type is `STOCK_IN`. |
| POST | `/batches/:batchId/adjustments` | `AdjustStockRequest` | `{ batch, transaction }`. Transaction type is `ADJUSTMENT_INCREASE` or `ADJUSTMENT_DECREASE`. |

```jsonc
// CreateBatchRequest
{
  "id": "bat_9a0d…",
  "transactionId": "txn_51f2…",
  "medicineId": "med_01",
  "batchNumber": "PCM-2610-C",      // server stores uppercase
  "quantity": 200,                  // 1–100000
  "receivedDate": "2026-10-31",     // ≤ today
  "expiryDate": "2028-04-30",       // > today and > receivedDate
  "remarks": "Monthly distributor order"   // optional
}

// ReceiveStockRequest
{
  "transactionId": "txn_…",
  "quantity": 50,                   // 1–100000
  "date": "2026-10-31",             // ≤ today, ≥ batch.receivedDate; batch must not be expired
  "remarks": "optional"
}

// AdjustStockRequest
{
  "transactionId": "txn_…",
  "direction": "INCREASE" | "DECREASE",
  "quantity": 5,                    // 1–100000; DECREASE ≤ batch.quantity; INCREASE not allowed on expired batches
  "reason": "DAMAGED" | "EXPIRED_DISPOSED" | "COUNT_CORRECTION" | "RETURNED" | "OTHER",
  "remarks": "required (≥3 chars) when reason is OTHER"
}
```

For a receipt dated today, the transaction `date` is the server's current time. For a past date, use noon local time on that date. Changing `quantity` and writing the transaction must happen in **one database transaction**.

### Settings

| Method | Path | Body | Response `data` |
| --- | --- | --- | --- |
| PATCH | `/settings` | `{ "pharmacyName": string, "expiryAlertDays": number }` | `Settings` |

### Demo (optional)

| Method | Path | Body | Response `data` |
| --- | --- | --- | --- |
| POST | `/demo/reset` | — | `null`. The client then reloads all reads. Only needed if you want the Settings → Demo data card on a demo server. The card is hidden in http mode. |

---

## 5. Write flow (optimistic with server reconciliation)

1. The UI calls an action in `src/data/actions.ts`, for example `inventoryActions.adjustStock(input)`.
2. The pure service validates the input against current state with the same rules listed above, then builds the new entities with client IDs and updates the store immediately. Validation errors are returned to the form and nothing is sent.
3. In http mode, `syncMutation` sends the matching request:
   - **Success:** the returned entity (`Medicine`, `Settings`, or `{ batch, transaction }`) replaces the local copy, so server-set fields such as timestamps win.
   - **Failure:** a "Change not saved" toast shows the server's `error.message`, and the app reloads all data from the server to drop the optimistic change.

Because the client validates first, server errors should be rare. The server must still enforce every rule, because the client cannot be trusted.

---

## 6. Data that stays in the frontend

These are UI concerns, not backend data, and remain in code:

- Enum **codes** (`TransactionType`, `AdjustmentReason`, `ExpiryStatus`) are part of the API contract. Their display **labels** live in `src/shared/labels.ts`.
- Report definitions, page copy, empty states, the welcome page feature text, navigation and images.
- The user's theme and sidebar preferences (`localStorage` key `medistock:ui`).

---

## 7. Integration checklist

- [ ] Implement the 6 read endpoints with the `{ data }` envelope. Point `VITE_API_BASE_URL` at them. The app should load, and the payloads must pass the integrity rules in §3.
- [ ] Implement the medicine, stock and settings mutations. Accept client IDs, keep the `{ batch, transaction }` response shape, and use the error codes in §2.
- [ ] Configure CORS with credentials (or serve on the same origin) and set up session or cookie auth for `/me`.
- [ ] Optionally drop `src/data/api/mock/` once mock mode is no longer needed. `src/data/testing/demo.ts` uses the same fixtures for unit tests.
- [ ] Run `npm run typecheck && npm run lint && npm test && npm run build`.
