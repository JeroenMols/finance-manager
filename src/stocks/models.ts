import { AccessToken } from '../account/models';

export type Holding = {
  ticker: string;
  quantity: number;
};

export type HoldingAddRequest = AccessToken & Holding;

export type Portfolio = {
  value: number;
  stocks: Stock[];
};

export type Stock = {
  stock_id: number;
  name: string;
  ticker: string;
  price: number;
  quantity: number;
  value: number;
  relativeValue: number;
};
