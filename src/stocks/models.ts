import { AccessToken } from '../account/models';

export type Holding = {
  ticker: string;
  shares: number;
};

export type HoldingAddRequest = AccessToken & Holding;
