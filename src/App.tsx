import './App.css';
import React, { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { useCookies } from 'react-cookie';
import { log } from './log'

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

function csvToStocks(csv: string) : Holding[] {
  let allValues = csv.split(',')
  let stocks : Holding[] = [];
  for (let i = 0; i < allValues.length; i = i + 2) {
    stocks.push({ ticker: allValues[i].trim(), shares: parseInt(allValues[i + 1]) });
  }
  return stocks
}

function stocksToCsv(stocks: Holding[]) {
  return stocks.map((a) => a.ticker + "," + a.shares).reduce((a, b) => (a + "," + b))
}


const defaultStocks = "VOO,6,IWDA.AS,30,MSFT,3,AAPL,5,TSLA,4,GOOG,7,NVDA,6,AMZN,7"

type Holding = {
  ticker: string,
  shares: number,
}

const App = () => {

  const [cookies, setCookie] = useCookies(['stocks']);

  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [toImport, setToImport] = useState("");
  const [holdings, setStocks] = useState<Holding[]>(csvToStocks(cookies.stocks ? cookies.stocks : defaultStocks));


  const addHolding = (event: React.FormEvent) => {
    event.preventDefault();
    let newStocks = [...holdings, { ticker: ticker, shares: parseInt(shares) }]
    setStocks(newStocks);
    setTicker("");
    setShares("");
    setCookie('stocks', stocksToCsv(newStocks))
  }

  const importStocks = (event: React.FormEvent) => {
    event.preventDefault();
    let imported = csvToStocks(toImport)
    setStocks(imported);
    setCookie('stocks', toImport)
    setToImport("");
  }

  const exportStocks = () => { alert(stocksToCsv(holdings)); }
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
      <StockList holdings={holdings} />
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

const StockList = (props: {holdings: Holding[]}) => {

  const [stockData, setStockData] = useState<StockData[]>([])

  useEffect(() => {
    let newStocksPromises : Promise<StockData>[] = []
    for (let i = 0; i < props.holdings.length; i++) {
      log("loading stock: " + props.holdings[i].ticker)
      newStocksPromises.push(loadHolding(props.holdings[i]))
    }
    Promise.all(newStocksPromises).then(stocks => {
      log(newStocksPromises)
      setStockData(stocks)
    })
  }, [props])

  const loadHolding = async (holding: Holding) => {
    let response = await fetch(base_url + 'stocks/' + holding.ticker + "/" + holding.shares)
    log("loaded stock: " + holding.ticker)
    return await response.json() as StockData
  }

  let stockElements : JSX.Element[] = []
  stockData.forEach((stock, index) => {
    stockElements.push(<Stock style={{ backgroundColor: toColor(index) }} key={stock.ticker} stockData={stock} />)
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

type StockData = {
  name: string,
  ticker: string,
  price: number,
  shares: number,
  totalValue: number
}

const Stock = (props : {stockData: StockData, style: CSSProperties} | {ticker: string}) => {

  if ("ticker" in props) {
    return <li>Loading ticker {props.ticker} </li>
  } else {
    return <li className="Stock" {...props}>
      <div>{props.stockData.name}</div>
      <div>{props.stockData.ticker}</div>
      <div className="Value">{props.stockData.price.toFixed(2)}</div>
      <div className="Value">{props.stockData.shares}</div>
      <div className="Value">{props.stockData.totalValue.toFixed(2)}</div>
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

function toColor(index: number) {
  return colors[index % colors.length]
}