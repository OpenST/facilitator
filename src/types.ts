export type Bytes32 = string;
export type Address = string;
export interface SubscriptionInfo {
  origin: {
    subscriptionQueries: Record<string, string>;
  };
  auxiliary: {
    subscriptionQueries: Record<string, string>;
  };
}
