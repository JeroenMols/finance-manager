type Holding = {
  ticker: string;
  shares: number;
};

type HoldingAddRequest = AccessToken & Holding;
