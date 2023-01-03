import React from 'react';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { log } from '../utilities/log';
import { BASE_URL } from '../config';
import HoldingRepository from './repository';
import { Holding } from './models';
import { AccessToken } from '../account/models';
import { stockColors, toColor } from '../utilities/colors';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryPie } from 'victory';
import { chartTheme } from '../utilities/chart-theme';

function csvToHoldings(csv: string): Holding[] {
  const allValues = csv.split(',');
  const holdings: Holding[] = [];
  for (let i = 0; i < allValues.length; i = i + 2) {
    holdings.push({
      ticker: allValues[i].trim(),
      shares: parseInt(allValues[i + 1]),
    });
  }
  return holdings;
}

function holdingsToCsv(holdings: Holding[]) {
  return holdings.map((a) => a.ticker + ',' + a.shares).reduce((a, b) => a + ',' + b);
}

async function batchAddHoldings(repo: HoldingRepository, holdings: Holding[]) {
  let result: Holding[] = [];
  for (const holding of holdings) {
    // TODO error handling
    result = (await repo.add(holding)) as Holding[];
  }
  return result;
}

const Stocks = (props: { accessToken: AccessToken }) => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [toImport, setToImport] = useState('');
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // TODO avoid reinstantiating
  const repo = new HoldingRepository(props.accessToken);

  const addHolding = (event: React.FormEvent) => {
    event.preventDefault();
    repo.add({ ticker: ticker, shares: parseInt(shares) }).then((holdings) => {
      if (holdings !== undefined) {
        setHoldings(holdings as Holding[]);
        setTicker('');
        setShares('');
      } else {
        alert('Something went very wrong');
      }
    });
  };

  const importHoldings = (event: React.FormEvent) => {
    event.preventDefault();
    const imported = csvToHoldings(toImport);
    const uploaded = batchAddHoldings(repo, imported).then((holdings) => {
      setHoldings(holdings);
      setToImport('');
    });
  };

  const exportHoldings = () => {
    alert(holdingsToCsv(holdings));
  };

  useEffect(() => {
    repo.get().then((holdings) => {
      if (holdings !== undefined) {
        setHoldings(holdings as Holding[]);
      } else {
        alert('Unable to load your holdings');
      }
    });
  }, [props.accessToken]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>Overview of your portfolio</h1>
      <form style={{ display: 'flex', width: '800px', justifyContent: 'center', gap: '10px' }} onSubmit={addHolding}>
        <input
          type="text"
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value);
          }}
        />
        <input
          type="number"
          placeholder="Amount of shares"
          value={shares}
          onChange={(e) => {
            setShares(e.target.value);
          }}
        />
        <input type="submit" value="Add holding" />
      </form>
      <StockList holdings={holdings} />
      <br />
      <div style={{ display: 'flex', width: '800px', justifyContent: 'center', gap: '10px' }}>
        <form onSubmit={importHoldings}>
          <input
            style={{ marginRight: '10px' }}
            type="text"
            value={toImport}
            onChange={(e) => {
              setToImport(e.target.value);
            }}
          />
          <input type="submit" value="Import Stocks" />
        </form>
        <div> or </div>
        <button onClick={exportHoldings}>Export stocks</button>
      </div>
    </div>
  );
};

export default Stocks;

const StockList = (props: { holdings: Holding[] }) => {
  const [stockData, setStockData] = useState<StockData[]>([]);

  useEffect(() => {
    const newStocksPromises: Promise<StockData>[] = [];
    for (let i = 0; i < props.holdings.length; i++) {
      log('loading stock: ' + props.holdings[i].ticker);
      newStocksPromises.push(loadHolding(props.holdings[i]));
    }
    Promise.all(newStocksPromises).then((stocks) => {
      log(newStocksPromises);
      setStockData(stocks);
    });
  }, [props]);

  const loadHolding = async (holding: Holding) => {
    const response = await fetch(BASE_URL + 'stocks/' + holding.ticker + '/' + holding.shares);
    log('loaded stock: ' + holding.ticker);
    return (await response.json()) as StockData;
  };

  const stockElements: JSX.Element[] = [];
  stockData.forEach((stock, index) => {
    stockElements.push(<Stock color={toColor(index)} ticker={stock.ticker} stockData={stock} />);
  });

  let totalPortfolioValue = 0;
  for (let i = 0; i < stockData.length; i++) {
    log('Adding ' + stockData[i].ticker + '   ' + stockData[i].price);
    totalPortfolioValue += stockData[i].totalValue;
  }

  let chartData: { x: string; y: number }[] = [{ x: '', y: 0 }];
  if (stockData.length > 0) {
    chartData = stockData.map((data) => {
      return {
        x: data.name,
        y: data.totalValue,
      };
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '90%', maxWidth: '800px' }}>
      <VictoryPie
        data={chartData}
        animate={{ easing: 'exp' }}
        colorScale={stockColors}
        labels={() => ''}
        padding={{ top: 20, right: 0, bottom: 20, left: 0 }}
        style={{
          parent: {
            width: '300px',
            height: '300px',
            margin: '0px auto',
          },
          data: {
            stroke: '#fff',
            strokeWidth: 5,
          },
        }}
      />
      {stockElements}
      <div
        style={{
          display: 'flex',
          color: '#FFF',
          backgroundColor: '#F19A3E',
          padding: '10px',
          borderRadius: '10px',
          fontWeight: 'bold',
        }}
      >
        <div style={{ width: '80%' }}>Total portfolio value</div>
        <div style={{ width: '20%', textAlign: 'right' }}>{totalPortfolioValue.toFixed(2)}</div>
      </div>
    </div>
  );
};

type StockData = {
  name: string;
  ticker: string;
  price: number;
  shares: number;
  totalValue: number;
};

interface StockProps {
  ticker: string;
  stockData: StockData;
  color: string;
}

const Stock: React.FC<StockProps> = ({ ticker, stockData, color }) => {
  const [showHistory, setShowHistory] = useState(false);

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
      onClick={() => setShowHistory(!showHistory)}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>{stockData.name}</div>
        <div style={{ width: '12%' }}>{stockData.ticker}</div>
        <div style={{ width: '12%', textAlign: 'right' }}>{stockData.price.toFixed(2)}</div>
        <div style={{ width: '10%', textAlign: 'right' }}>{stockData.shares}</div>
        <div style={{ width: '14%', textAlign: 'right' }}>{stockData.totalValue.toFixed(2)}</div>
      </div>
      {showHistory ? <StockDetails ticker={ticker} /> : <></>}
    </div>
  );
};

type StockPrice = {
  date: string;
  price: number;
  totalValue: number;
};

interface StockHistoryProps {
  ticker: string;
}

const StockDetails: React.FC<StockHistoryProps> = ({ ticker }) => {
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
          theme={chartTheme}
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
