import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { useCookies } from 'react-cookie';
import { log } from './log.js'

const base_url = process.env.REACT_APP_SERVER_URL

console.log(`

          __                            
         / /__  _________  ___  ____    
    __  / / _ \\/ ___/ __ \\/ _ \\/ __ \\   
   / /_/ /  __/ /  / /_/ /  __/ / / /  
   \\____/\\___/_/   \\____/\\___/_/ /_/

Built by Jeroen Mols
Checkout his portfolio at https://jeroenmols.com

`                           
)

function csvToStocks(csv) {
  let allValues = csv.split(',')
  let stocks = [];
  for (let i = 0; i < allValues.length; i = i + 2) {
    stocks.push({ ticker: allValues[i].trim(), shares: parseInt(allValues[i + 1]) });
  }
  return stocks
}

function stocksToCsv(stocks) {
  return stocks.map((a) => a.ticker + "," + a.shares).reduce((a, b) => (a + "," + b))
}


const defaultStocks = "VOO,6,IWDA.AS,30,MSFT,3,AAPL,5,TSLA,4,GOOG,7,NVDA,6,AMZN,7"

const App = () => {

  const [cookies, setCookie] = useCookies(['stocks']);

  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [toImport, setToImport] = useState("");
  const [stocks, setStocks] = useState(csvToStocks(cookies.stocks ? cookies.stocks : defaultStocks));


  const addHolding = (event) => {
    event.preventDefault();
    let newStocks = [...stocks, { ticker: ticker, shares: shares }]
    setStocks(newStocks);
    setTicker("");
    setShares("");
    setCookie('stocks', stocksToCsv(newStocks))
  }

  const importStocks = (event) => {
    event.preventDefault();
    let imported = csvToStocks(toImport)
    setStocks(imported);
    setCookie('stocks', toImport)
    setToImport("");
  }

  const exportStocks = () => { alert(stocksToCsv(stocks)); }
  log('Cookie: ' + cookies)

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

const StockList = (props) => {

  const [stockData, setStockData] = useState([])

  useEffect(() => {
    let newStocksPromises = []
    for (let i = 0; i < props.stocks.length; i++) {
      log("loading stock: " + props.stocks[i].ticker)
      newStocksPromises.push(loadStock(props.stocks[i]))
    }
    Promise.all(newStocksPromises).then(values => {
      log(newStocksPromises)
      setStockData(values)
    })
  }, [props])

  const loadStock = async (stock) => {
    let response = await fetch(base_url + 'stocks/' + stock.ticker + "/" + stock.shares)
    log("loaded stock: " + stock.ticker)
    return await response.json()
  }

  let stockElements = []
  stockData.forEach((stock, index) => {
    stockElements.push(<Stock style={{ backgroundColor: toColor(index) }} key={stock.ticker} stockdata={stock} />)
  })

  let totalPortfolioValue = 0
  for (let i = 0; i < stockData.length; i++) {
    log("Adding " + stockData[i].ticker + "   " + stockData[i].price)
    totalPortfolioValue += stockData[i].totalValue
  }

  let chart = <div />
  if (stockData.length > 0) {
    let chartData = stockData.map((data, index) => { return { title: data.name, value: data.totalValue, color: toColor(index) } })
    chart = <div className="Chart">
      <PieChart
        radius={49}
        data={chartData}
        animate={true}
        segmentsShift={1}
      />
    </div>
  }

  return (
    <ul className='StockList' >
      {chart}
      {stockElements}
      <li className='Stock'>
        <div>Total portfolio value</div>
        <div></div>
        <div className="Value" />
        <div className="Value" />
        <div className="Value">{totalPortfolioValue.toFixed(2)}</div>
      </li>
    </ul>
  )
}

const Stock = (props) => {

  if (props.stockdata.price == 0) {
    return <li>Loading ticker {props.ticker} </li>
  } else {
    return <li className="Stock" {...props}>
      <div>{props.stockdata.name}</div>
      <div>{props.stockdata.ticker}</div>
      <div className="Value">{props.stockdata.price.toFixed(2)}</div>
      <div className="Value">{props.stockdata.shares}</div>
      <div className="Value">{props.stockdata.totalValue.toFixed(2)}</div>
    </li>
  }
}

const colors = ['#C62828',
  '#AD1457',
  '#6A1B9A',
  '#283593',
  '#1565C0',
  '#00838F',
  '#2E7D32',
  '#9E9D24',
  '#F9A825',
  '#EF6C00',
  '#D84315',
  '#4E342E',
  '#37474F']

function toColor(index) {
  return colors[index % colors.length]
}