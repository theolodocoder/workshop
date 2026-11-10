import { z } from "zod";
import { MAX_LINES, QTY_MAX, QTY_MIN } from "./limits";

// FIX 5: every input from the browser is checked on the server before we use it.
export const CartLine = z.object({
  productId: z.string().min(1).max(64),
  qty: z.number().int().min(QTY_MIN).max(QTY_MAX),
});

export const Cart = z.array(CartLine).min(1).max(MAX_LINES);

export const CheckUrl = z.string().trim().max(2048).url();

export type CartLineInput = z.infer<typeof CartLine>;
