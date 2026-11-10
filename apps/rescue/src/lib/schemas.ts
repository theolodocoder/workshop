import { z } from "zod";

// FIX 5: every input from the browser is checked on the server before we use it.
export const CartLine = z.object({
  productId: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(10),
});

export const Cart = z.array(CartLine).min(1).max(20);

export const CheckUrl = z.string().trim().max(2048).url();

export type CartLineInput = z.infer<typeof CartLine>;
