export type Bytes32 = string;
export type Address = string;
export interface SubscriptionInfo {
  origin: {
    wsSubGraphEndPoint: string;
    httpSubGraphEndPoint: string;
    subscriptionQueries: Record<string, string>;
  };
  auxiliary: {
    wsSubGraphEndPoint: string;
    httpSubGraphEndPoint: string;
    subscriptionQueries: Record<string, string>;
  };
};
