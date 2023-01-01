import React, { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { log } from '../utilities/log';
import { BASE_URL } from '../config';
import HoldingRepository from './repository';
import { Holding } from './models';
import { AccessToken } from '../account/models';
import { toColor } from '../utilities/colors';

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
      <h1>Welcome to the stocks app</h1>
      <form onSubmit={addHolding}>
        <label>
          Add holding:
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
        </label>
        <input type="submit" value="Add" />
      </form>
      <StockList holdings={holdings} />
      <br />
      <form onSubmit={importHoldings}>
        <input
          type="text"
          value={toImport}
          onChange={(e) => {
            setToImport(e.target.value);
          }}
        />
        <input type="submit" value="Import Stocks" />
      </form>
      <button onClick={exportHoldings}>Export stocks</button>
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
    stockElements.push(<Stock style={{ backgroundColor: toColor(index) }} key={stock.ticker} stockData={stock} />);
  });

  let totalPortfolioValue = 0;
  for (let i = 0; i < stockData.length; i++) {
    log('Adding ' + stockData[i].ticker + '   ' + stockData[i].price);
    totalPortfolioValue += stockData[i].totalValue;
  }

  let chart = <div />;
  if (stockData.length > 0) {
    const chartData = stockData.map((data, index) => {
      return {
        title: data.name,
        value: data.totalValue,
        color: toColor(index),
      };
    });
    chart = (
      <div style={{ width: '300px', height: '300px', padding: '20px', margin: '0px auto' }}>
        <PieChart radius={49} data={chartData} animate={true} segmentsShift={1} />
      </div>
    );
  }

  return (
    <ul style={{ paddingInlineStart: '0px', display: 'inline-block' }}>
      {chart}
      {stockElements}
      <li
        style={{
          display: 'flex',
          color: '#FFF',
          width: '800px',
          backgroundColor: '#F19A3E',
          padding: '10px',
          margin: '5px',
          borderRadius: '10px',
          fontWeight: 'bold',
        }}
      >
        <div style={{ width: '80%' }}>Total portfolio value</div>
        <div style={{ width: '20%', textAlign: 'right' }}>{totalPortfolioValue.toFixed(2)}</div>
      </li>
    </ul>
  );
};

type StockData = {
  name: string;
  ticker: string;
  price: number;
  shares: number;
  totalValue: number;
};

const Stock = (props: { stockData: StockData; style: CSSProperties } | { ticker: string }) => {
  if ('ticker' in props) {
    return <li>Loading ticker {props.ticker} </li>;
  } else {
    console.log('returning item');
    return (
      <div
        style={{
          display: 'flex',
          color: '#FFF',
          width: '800px',
          backgroundColor: '#F19A3E',
          padding: '10px',
          margin: '5px',
          borderRadius: '10px',
          fontWeight: 'bold',
          ...props.style,
        }}
      >
        <div style={{ width: '60%' }}>{props.stockData.name}</div>
        <div style={{ width: '10%' }}>{props.stockData.ticker}</div>
        <div style={{ width: '10%', textAlign: 'right' }}>{props.stockData.price.toFixed(2)}</div>
        <div style={{ width: '8%', textAlign: 'right' }}>{props.stockData.shares}</div>
        <div style={{ width: '12%', textAlign: 'right' }}>{props.stockData.totalValue.toFixed(2)}</div>
      </div>
    );
  }
};
