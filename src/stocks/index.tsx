import React from 'react';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { log } from '../utilities/log';
import { BASE_URL } from '../config';
import HoldingRepository from './repository';
import { Holding } from './models';
import { AccessToken } from '../account/models';
import { stockColors, toColor } from '../utilities/colors';
import { VictoryArea, VictoryAxis, VictoryChart, VictoryStack } from 'victory';
import { chartTheme } from '../utilities/chart-theme';
import { Stock, StockData, StockPrice } from './stock';

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
      <div style={{ width: '250px', height: '250px', padding: '20px', margin: '0px auto' }}>
        <PieChart radius={49} data={chartData} animate={true} segmentsShift={1} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '90%', maxWidth: '800px' }}>
      {chart}
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
      {stockElements.length > 0 ? <PortfolioHistory stocks={stockData} /> : <></>}
    </div>
  );
};

type HistoryItem = {
  ticker: string;
  prices: StockPrice[];
};

const PortfolioHistory = (props: { stocks: StockData[] }) => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const newStocksPromises: Promise<HistoryItem>[] = [];
    for (let i = 0; i < props.stocks.length; i++) {
      log('loading history: ' + props.stocks[i].ticker);
      newStocksPromises.push(loadHistory(props.stocks[i]));
    }
    Promise.all(newStocksPromises).then((historyData) => {
      log(newStocksPromises);
      setHistoryData(historyData);
    });
  }, [props]);

  let tickValues: string[] = [];
  let tickFormat: string[] = [];
  const areaItems: JSX.Element[] = [];
  if (historyData.length > 0) {
    const item = historyData[0].prices;
    tickValues = item.map((item) => item.date);
    tickFormat = tickValues.map((date) => new Date(Date.parse(date)).toLocaleString('default', { month: 'short' }));

    historyData.forEach((item) => {
      areaItems.push(<VictoryArea data={item.prices} x="date" y="price" />);
    });
  }

  const loadHistory = async (stock: StockData) => {
    const response = await fetch(BASE_URL + 'stocks/history/' + stock.ticker + '/' + stock.shares);
    log('loaded history: ' + stock.ticker);
    return { ticker: stock.ticker, prices: (await response.json()) as StockPrice[] };
  };
  return (
    <>
      {historyData.length > 0 ? (
        <VictoryChart
          theme={chartTheme}
          height={200}
          width={600}
          padding={{ top: 20, right: 30, bottom: 30, left: 50 }}
        >
          <VictoryAxis tickValues={tickValues} tickFormat={tickFormat} />
          <VictoryAxis dependentAxis tickFormat={(x) => `$${x}`} />
          <VictoryStack colorScale={stockColors}>{areaItems}</VictoryStack>
        </VictoryChart>
      ) : (
        'loading history'
      )}
    </>
  );
};
