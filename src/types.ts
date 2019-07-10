import StakeRequestedHandler from "./handlers/StakeRequestHandler";
import ProveGatewayHandler from "./handlers/ProveGatewayHandler";
import AnchorHandler from './handlers/AnchorHandler';

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
export interface HandlerTypes {
  stakeRequesteds: StakeRequestedHandler,
  gatewayProvens: ProveGatewayHandler,
  anchor: AnchorHandler,
};
