import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';

const App = () => {

  const stocks = ["IWDA.AS", "AAPL", "TSLA", "GOOG"]

  return (
    <div className="App">
      <h1>Welcome to the stocks app</h1>
      <StockList tickers={stocks} />
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
