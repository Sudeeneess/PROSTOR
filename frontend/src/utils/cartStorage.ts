export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export const CART_KEY = 'cart';
export const CART_UPDATE_EVENT = 'prostoricartupdate';

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATE_EVENT));
}

export function getQuantityForProduct(cart: CartItem[], productId: number): number {
  const item = cart.find((i) => i.id === productId);
  return item?.quantity ?? 0;
}
