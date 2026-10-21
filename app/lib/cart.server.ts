/**
 * Warenkorb-Abstraktion für die Startseite.
 * Mock-Modus: Positionen in der Session (Cookie), aufgelöst gegen die Testdaten.
 * Live-Modus: Hydrogen-Cart (Storefront API), auf dieselbe MiniCart-Form gemappt.
 */
import type {RouterContextProvider} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {isMockStorefront} from './catalog';
import {MOCK_MERCHANDISE} from './mock/catalog';

export type MiniCartLine = {
  id: string;
  merchandiseId: string;
  title: string;
  variantTitle: string;
  image: string | null;
  quantity: number;
  amount: string;
  currencyCode: string;
};

export type MiniCart = {
  totalQuantity: number;
  lines: MiniCartLine[];
  subtotal: {amount: string; currencyCode: string};
  checkoutUrl: string | null;
  mock: boolean;
};

export type CartIntent =
  | {intent: 'add'; merchandiseId: string; quantity: number}
  | {intent: 'update'; lineId: string; quantity: number}
  | {intent: 'remove'; lineId: string};

const SESSION_KEY = 'mockCart';
type MockLine = {merchandiseId: string; quantity: number};

export async function getCart(context: Readonly<RouterContextProvider>): Promise<MiniCart> {
  if (isMockStorefront(context.env)) {
    return buildMockCart(readMockLines(context));
  }
  return mapLiveCart(await context.cart.get());
}

export async function updateCart(
  context: Readonly<RouterContextProvider>,
  change: CartIntent,
): Promise<{cart: MiniCart; headers: Headers}> {
  if (isMockStorefront(context.env)) {
    const lines = applyMockChange(readMockLines(context), change);
    context.session.set(SESSION_KEY, JSON.stringify(lines));
    return {cart: buildMockCart(lines), headers: new Headers()};
  }

  const {cart} = context;
  const result =
    change.intent === 'add'
      ? await cart.addLines([{merchandiseId: change.merchandiseId, quantity: change.quantity}])
      : change.intent === 'update'
        ? await cart.updateLines([{id: change.lineId, quantity: change.quantity}])
        : await cart.removeLines([change.lineId]);

  const headers = result.cart?.id ? cart.setCartId(result.cart.id) : new Headers();
  return {cart: mapLiveCart(result.cart as CartApiQueryFragment | null), headers};
}

function readMockLines(context: Readonly<RouterContextProvider>): MockLine[] {
  try {
    const raw = context.session.get(SESSION_KEY);
    const parsed: unknown = raw ? JSON.parse(String(raw)) : [];
    return Array.isArray(parsed)
      ? (parsed as MockLine[]).filter((l) => MOCK_MERCHANDISE.has(l?.merchandiseId) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function applyMockChange(lines: MockLine[], change: CartIntent): MockLine[] {
  const clampQty = (q: number) => Math.max(0, Math.min(10, Math.floor(q)));
  switch (change.intent) {
    case 'add': {
      if (!MOCK_MERCHANDISE.get(change.merchandiseId)?.available) return lines;
      const existing = lines.find((l) => l.merchandiseId === change.merchandiseId);
      if (existing) {
        return lines.map((l) =>
          l === existing ? {...l, quantity: clampQty(l.quantity + change.quantity)} : l,
        );
      }
      return [...lines, {merchandiseId: change.merchandiseId, quantity: clampQty(change.quantity)}];
    }
    case 'update':
      return lines
        .map((l) => (l.merchandiseId === change.lineId ? {...l, quantity: clampQty(change.quantity)} : l))
        .filter((l) => l.quantity > 0);
    case 'remove':
      return lines.filter((l) => l.merchandiseId !== change.lineId);
  }
}

function buildMockCart(lines: MockLine[]): MiniCart {
  const resolved = lines.map((line) => {
    const item = MOCK_MERCHANDISE.get(line.merchandiseId)!;
    return {
      id: line.merchandiseId,
      merchandiseId: line.merchandiseId,
      title: item.title,
      variantTitle: item.variantTitle,
      image: `${item.image}.webp`,
      quantity: line.quantity,
      amount: (Number(item.price.amount) * line.quantity).toFixed(2),
      currencyCode: item.price.currencyCode,
    };
  });
  return {
    totalQuantity: resolved.reduce((sum, l) => sum + l.quantity, 0),
    lines: resolved,
    subtotal: {
      amount: resolved.reduce((sum, l) => sum + Number(l.amount), 0).toFixed(2),
      currencyCode: 'EUR',
    },
    checkoutUrl: null,
    mock: true,
  };
}

function mapLiveCart(cart: CartApiQueryFragment | null): MiniCart {
  const lines = (cart?.lines.nodes ?? []).map((line) => {
    const {merchandise} = line;
    return {
      id: line.id,
      merchandiseId: merchandise.id,
      title: merchandise.product.title,
      variantTitle: merchandise.title,
      image: merchandise.image?.url ?? null,
      quantity: line.quantity,
      amount: line.cost.totalAmount.amount,
      currencyCode: line.cost.totalAmount.currencyCode,
    };
  });
  return {
    totalQuantity: cart?.totalQuantity ?? 0,
    lines,
    subtotal: cart?.cost.subtotalAmount ?? {amount: '0', currencyCode: 'EUR'},
    checkoutUrl: cart?.checkoutUrl ?? null,
    mock: false,
  };
}
