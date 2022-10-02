import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';

const App = () => {

  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [toImport, setToImport] = useState("");
  const [stocks, setStocks] = useState([
    { ticker: "IWDA.AS", shares: 1 },
    { ticker: "AAPL", shares: 5 },
    { ticker: "TSLA", shares: 10 }]);

  const addHolding = (event) => {
    event.preventDefault();
    setStocks([...stocks, { ticker: ticker, shares: shares }]);
    setTicker("");
    setShares("");
  }

  const importStocks = (event) => {
    event.preventDefault();
    let allValues = toImport.split(',')
    let stocks = [];
    for (let i = 0; i < allValues.length; i = i + 2) {
      stocks.push({ ticker: allValues[i].trim(), shares: parseInt(allValues[i + 1]) });
    }
    setStocks(stocks);
    setToImport("");
  }

  const exportStocks = () => {
    let csv = stocks.map((a) => a.ticker + "," + a.shares).reduce((a, b) => (a + "," + b));
    alert(csv);
  }

  return (
    <div className="App">
      <h1>Welcome to the stocks app</h1>
      <form onSubmit={addHolding}>
        <label>Add holding:
          <input
            type="text"
            placeholder='Ticker'
            value={ticker}
            onChange={e => { setTicker(e.target.value) }} />
          <input
            type="number"
            placeholder='Amount of shares'
            value={shares}
            onChange={e => { setShares(e.target.value) }} />
        </label>
        <input type="submit" value="Add" />
      </form>
      <StockList stocks={stocks} />
      <br />
      <form onSubmit={importStocks}>
        <input
          type="text"
          value={toImport}
          onChange={e => { setToImport(e.target.value) }} />
        <input type="submit" value="Import Stocks" />
      </form>
      <button onClick={exportStocks}>Export stocks</button>
    </div>
  );
}

export default App;

class StockData {
  constructor(name, ticker, price, shares) {
    this.name = name
    this.ticker = ticker
    this.price = price
    this.shares = shares
  }

  totalValue() {
    return (this.shares * this.price).toFixed(2)
  }
}

const StockList = (props) => {

  const [stockData, setStockData] = useState([])

  useEffect(() => {
    let newStocksPromises = []
    for (let i = 0; i < props.stocks.length; i++) {
      console.log("loading stock: " + props.stocks[i].ticker)
      newStocksPromises.push(loadStock(props.stocks[i]))
    }
    Promise.all(newStocksPromises).then(values => {
      console.log(newStocksPromises)
      setStockData(values)
    })
  }, [props])

  const loadStock = async (stock) => {
    let response = await fetch('/finance/quote?symbols=' + stock.ticker)
    console.log("loaded stock: " + stock.ticker)
    return toStockData(await response.json(), stock.shares)
  }

  let stockElements = []
  stockData.forEach(stock => {
    stockElements.push(<Stock key={stock.ticker} stockData={stock} />)
  })

  let totalPortfolioValue = 0
  for (let i = 0; i < stockData.length; i++) {
    console.log("Adding " + stockData[i].ticker + "   " + stockData[i].price)
    totalPortfolioValue += parseFloat(stockData[i].totalValue())
  }
  totalPortfolioValue = totalPortfolioValue.toFixed(2)

  return (
    <ul className='StockList'>
      {stockElements}
      <li className='Stock'>
        <div>Total portfolio value</div>
        <div></div>
        <div className="Value" />
        <div className="Value" />
        <div className="Value">{totalPortfolioValue}</div>
      </li>
    </ul>
  )
}

const Stock = (props) => {

  if (props.stockData.price == 0) {
    return <li>Loading ticker {props.ticker} </li>
  } else {
    return <li className="Stock">
      <div>{props.stockData.name}</div>
      <div>{props.stockData.ticker}</div>
      <div className="Value">{props.stockData.price}</div>
      <div className="Value">{props.stockData.shares}</div>
      <div className="Value">{props.stockData.totalValue()}</div>
    </li>
  }
}

function toStockData(quoteData, shares) {
  let result = quoteData.quoteResponse.result[0];
  let stockData = new StockData(result.longName, result.symbol, result.regularMarketPrice, shares);
  return stockData;
}
