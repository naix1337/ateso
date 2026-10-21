import {data} from 'react-router';
import type {Route} from './+types/api.cart';
import {updateCart, type CartIntent} from '~/lib/cart.server';

/** Ressourcen-Route für Warenkorb-Änderungen der Startseite (Mock + Live). */
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const change = parseIntent(form);
  if (!change) {
    return data(
      {error: 'Ungültige Warenkorb-Aktion', cart: null},
      {status: 400},
    );
  }

  const {cart, headers} = await updateCart(context, change);
  return data({error: null, cart}, {headers});
}

function parseIntent(form: FormData): CartIntent | null {
  const intent = form.get('intent');
  const quantity = Number(form.get('quantity') ?? 1);
  if (!Number.isFinite(quantity)) return null;

  if (intent === 'add') {
    const merchandiseId = String(form.get('merchandiseId') ?? '');
    return merchandiseId
      ? {intent, merchandiseId, quantity: Math.max(1, quantity)}
      : null;
  }
  const lineId = String(form.get('lineId') ?? '');
  if (!lineId) return null;
  if (intent === 'update') return {intent, lineId, quantity};
  if (intent === 'remove') return {intent, lineId};
  return null;
}
