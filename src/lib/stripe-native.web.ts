import type { PropsWithChildren } from 'react';

export function StripeProvider(props: PropsWithChildren) {
  return props.children as any;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: undefined }),
    presentPaymentSheet: async () => ({ error: undefined }),
  } as any;
}
