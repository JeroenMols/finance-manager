import React, { useEffect, useState } from 'react';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory';
import { BASE_URL } from '../config';
import { chartThemeLight } from '../utilities/chart-theme-light';
import { ReactComponent as ExpandSvg } from '../img/arrow-expand.svg';
import { ReactComponent as CollapseSvg } from '../img/arrow-collapse.svg';

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
        padding: '10px 20px',
        gap: '10px',
        borderRadius: '10px',
        fontWeight: 'bold',
        backgroundColor: color,
        flexDirection: 'column',
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flexGrow: 1 }}>{stockData.name}</div>
        <div style={{ textAlign: 'right' }}>11%</div>
        <div style={{ width: '20%', textAlign: 'right', paddingRight: '10px' }}>{stockData.totalValue.toFixed(2)}</div>
        {showDetails ? <CollapseSvg fill="#fff" /> : <ExpandSvg fill="#fff" />}
      </div>
      {showDetails ? <StockDetails stockData={stockData} /> : <></>}
    </div>
  );
};

interface StockDetailsProps {
  stockData: StockData;
}

const StockDetails: React.FC<StockDetailsProps> = ({ stockData }) => {
  const [history, setHistory] = useState<StockPrice[]>([]);
  useEffect(() => {
    loadHistory(stockData.ticker).then((history) => setHistory(history));
  }, [stockData]);

  const loadHistory = async (ticker: string): Promise<StockPrice[]> => {
    const response = await fetch(BASE_URL + 'stocks/history/' + ticker + '/' + '1');
    return (await response.json()) as StockPrice[];
  };

  const tickValues = history.map((item) => item.date);
  const tickFormat = tickValues.map((date) => new Date(Date.parse(date)).toLocaleString('default', { month: 'short' }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '0px 50px' }}>
      {history.length === 0 ? (
        <div style={{ height: '185px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading...</div>
        </div>
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
      <div style={{ display: 'flex', width: '100%', paddingTop: '30px' }}>
        <div style={{ width: '25%' }}>Ticker</div>
        <div style={{ width: '25%' }}>{stockData.ticker}</div>
        <div style={{ width: '25%' }}>Average price</div>
        <div style={{ width: '25%' }}>110 $</div>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ width: '25%' }}>Share price</div>
        <div style={{ width: '25%' }}>{stockData.price}</div>
        <div style={{ width: '25%' }}>Buying cost</div>
        <div style={{ width: '25%' }}>30 $</div>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        <div style={{ width: '25%' }}>Shares</div>
        <div style={{ width: '25%' }}>{stockData.shares}</div>
      </div>
      <div style={{ paddingTop: '30px' }}>Transaction history:</div>
      <div style={{ display: 'flex', width: '100%', padding: '10px 10px 0 10px' }}>
        <div style={{ width: '20%' }}>10/02/2022</div>
        <div style={{ width: '20%' }}>Buy</div>
        <div style={{ width: '10%' }}>7</div>
        <div style={{ width: '15%', textAlign: 'right' }}>112$</div>
        <div style={{ width: '20%', textAlign: 'right' }}>10$</div>
      </div>
      <div style={{ display: 'flex', width: '100%', padding: '10px 10px 0 10px' }}>
        <div style={{ width: '20%' }}>10/02/2022</div>
        <div style={{ width: '20%' }}>Buy</div>
        <div style={{ width: '10%' }}>7</div>
        <div style={{ width: '15%', textAlign: 'right' }}>112$</div>
        <div style={{ width: '20%', textAlign: 'right' }}>10$</div>
      </div>
      <div style={{ display: 'flex', width: '100%', padding: '10px 10px 20px 10px' }}>
        <div style={{ width: '20%' }}>10/02/2022</div>
        <div style={{ width: '20%' }}>Buy</div>
        <div style={{ width: '10%' }}>7</div>
        <div style={{ width: '15%', textAlign: 'right' }}>112$</div>
        <div style={{ width: '20%', textAlign: 'right' }}>10$</div>
      </div>
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
