import Constants from 'expo-constants';

export type CheckoutInitResponse = {
  paymentIntentClientSecret: string;
  ephemeralKey?: string;
  customer?: string;
};

export function getStripeApiBase() {
  const extra: any = Constants.expoConfig?.extra || {};
  return (extra?.stripe?.apiBase as string) || '';
}
