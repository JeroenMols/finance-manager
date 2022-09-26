import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';

const App = () => {

  const [ticker, setTicker] = useState("");
  const [toImport, setToImport] = useState("");
  const [stocks, setStocks] = useState(["IWDA.AS", "AAPL", "TSLA"]);

  const addTicker = (event) => {
    event.preventDefault();
    setStocks([...stocks, ticker]);
    setTicker("");
  }

  const exportStocks = () => {
    let csv = stocks.reduce((a, b) => (a + "," + b));
    alert(csv);
  }

  const importStocks = (event) => {
    event.preventDefault();
    setStocks(toImport.split(','));
    setToImport("");
  }

  return (
    <div className="App">
      <h1>Welcome to the stocks app</h1>
      <form onSubmit={addTicker}>
        <label>Add stock ticker:
          <input
            type="text"
            value={ticker}
            onChange={e => { setTicker(e.target.value) }} />
        </label>
        <input type="submit" value="Add" />
      </form>
      <StockList tickers={stocks} />
      <br />
      <form onSubmit={importStocks}>
        <input
          type="text"
          value={toImport}
          onChange={e => { setToImport(e.target.value) }} />
        <input type="submit" value="Import Stocks" />
        <button onClick={exportStocks}>Export stocks</button>
      </form>
    </div>
  );
}

export default App;

class StockData {
  constructor(name, ticker, price) {
    this.name = name
    this.ticker = ticker
    this.price = price
  }
}

const StockList = (props) => {

  let stockElements = []
  props.tickers.forEach(ticker => {
    stockElements.push(<Stock key={ticker} ticker={ticker} />)
  })

  return (
    <ul className='StockList'>
      {stockElements}
    </ul>
  )
}

const Stock = (props) => {

  const [stockData, setStockData] = useState(null)

  useEffect(() => {
    //https://syncwith.com/yahoo-finance/yahoo-finance-api
    // https://stackoverflow.com/a/64641435
    fetch('/finance/quote?symbols=' + props.ticker)
      .then((response) => response.json())
      .then((data) => {
        setStockData(toStockData(data))
      }).catch((err) => { console.log(err.message) })
  })

  if (stockData == null) {
    return <li>Loading ticker {props.ticker} </li>
  } else {
    return <li className="Stock">{stockData.name} ({stockData.ticker}) - {stockData.price}</li>
  }
}

function toStockData(quoteData) {
  let result = quoteData.quoteResponse.result[0];
  let stockData = new StockData(result.longName, result.symbol, result.regularMarketPrice);
  return stockData;
}
