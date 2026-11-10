// The cart lives in localStorage for the preview only. Prices here are never trusted: the server prices the order (fix 3).
export type CartLine = { id: string; name: string; price_cents: number; qty: number };

export function getCart(): CartLine[] {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

export function addToCart(line: CartLine) {
  const cart = getCart();
  const existing = cart.find((l) => l.id === line.id);
  if (existing) existing.qty += line.qty;
  else cart.push(line);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}
