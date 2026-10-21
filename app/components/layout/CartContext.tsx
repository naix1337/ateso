import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import type {MiniCart} from '~/lib/cart.server';
import type {RootLoader} from '~/root';

type CartUI = {open: boolean; setOpen: (open: boolean) => void};

const CartUIContext = createContext<CartUI>({open: false, setOpen: () => {}});

export function CartUIProvider({children}: {children: React.ReactNode}) {
  const [open, setOpen] = useState(false);
  return <CartUIContext.Provider value={{open, setOpen}}>{children}</CartUIContext.Provider>;
}

export const useCartUI = () => useContext(CartUIContext);

/** Aktueller Warenkorb aus dem Root-Loader. */
export function useMiniCart(): MiniCart | null {
  return useRouteLoaderData<RootLoader>('root')?.miniCart ?? null;
}

type CartActionData = {error: string | null; cart: MiniCart | null};

/**
 * Formular-Helfer für /api/cart. `submit` sendet die Änderung; bei „add“
 * öffnet sich danach der Warenkorb.
 */
export function useCartAction(key?: string) {
  const fetcher = useFetcher<CartActionData>({key});
  const {setOpen} = useCartUI();
  const lastIntent = useRef<string | null>(null);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.cart && lastIntent.current === 'add') {
      lastIntent.current = null;
      setOpen(true);
    }
  }, [fetcher.state, fetcher.data, setOpen]);

  const submit = useCallback(
    (fields: Record<string, string | number>) => {
      lastIntent.current = String(fields.intent);
      fetcher.submit(
        Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])),
        {method: 'post', action: '/api/cart'},
      );
    },
    [fetcher],
  );

  return {submit, busy: fetcher.state !== 'idle', data: fetcher.data};
}
