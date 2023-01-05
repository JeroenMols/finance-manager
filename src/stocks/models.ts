import { AccessToken } from '../account/models';

export type Holding = {
  ticker: string;
  quantity: number;
};

export type HoldingAddRequest = AccessToken & Holding;
