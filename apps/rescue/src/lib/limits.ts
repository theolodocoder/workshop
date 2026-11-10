// One source of truth for cart limits. The server checks them with Zod (schemas.ts);
// the browser uses this tiny check so it doesn't download Zod just to give a friendly message.
export const QTY_MIN = 1;
export const QTY_MAX = 10;
export const MAX_LINES = 20;

export const isValidQty = (qty: number) => Number.isInteger(qty) && qty >= QTY_MIN && qty <= QTY_MAX;
