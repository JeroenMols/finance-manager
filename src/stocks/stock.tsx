import React, { useEffect, useState } from 'react';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory';
import { BASE_URL } from '../config';
import { chartThemeLight } from '../utilities/chart-theme-light';

interface StockProps {
  ticker: string;
  stockData: StockData;
  color: string;
}

export const Stock: React.FC<StockProps> = ({ ticker, stockData, color }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        color: '#FFF',
        padding: '10px',
        gap: '10px',
        borderRadius: '10px',
        fontWeight: 'bold',
        backgroundColor: color,
        flexDirection: 'column',
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>{stockData.name}</div>
        <div style={{ width: '12%' }}>{stockData.ticker}</div>
        <div style={{ width: '12%', textAlign: 'right' }}>{stockData.price.toFixed(2)}</div>
        <div style={{ width: '10%', textAlign: 'right' }}>{stockData.shares}</div>
        <div style={{ width: '14%', textAlign: 'right' }}>{stockData.totalValue.toFixed(2)}</div>
      </div>
      {showDetails ? <StockDetails ticker={ticker} /> : <></>}
    </div>
  );
};

interface StockDetailsProps {
  ticker: string;
}

const StockDetails: React.FC<StockDetailsProps> = ({ ticker }) => {
  const [history, setHistory] = useState<StockPrice[]>([]);
  useEffect(() => {
    loadHistory(ticker).then((history) => setHistory(history));
  }, [ticker]);

  const loadHistory = async (ticker: string): Promise<StockPrice[]> => {
    const response = await fetch(BASE_URL + 'stocks/history/' + ticker + '/' + '1');
    return (await response.json()) as StockPrice[];
  };

  const tickValues = history.map((item) => item.date);
  const tickFormat = tickValues.map((date) => new Date(Date.parse(date)).toLocaleString('default', { month: 'short' }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '0px 50px' }}>
      {history.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <VictoryChart
          theme={chartThemeLight}
          height={200}
          width={600}
          padding={{ top: 20, right: 30, bottom: 30, left: 50 }}
        >
          <VictoryAxis tickValues={tickValues} tickFormat={tickFormat} />
          <VictoryAxis dependentAxis tickFormat={(x) => `$${x}`} />
          <VictoryLine data={history} x="date" y="price" />
        </VictoryChart>
      )}
    </div>
  );
};

// TODO: this probably shouldn't be exported
export type StockData = {
  name: string;
  ticker: string;
  price: number;
  shares: number;
  totalValue: number;
};

// TODO: this probably shouldn't be exported
export type StockPrice = {
  date: string;
  price: number;
  totalValue: number;
};
