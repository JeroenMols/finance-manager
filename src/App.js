import logo from './logo.svg';
import './App.css';
import React from 'react';
import { useEffect, useState } from 'react';

const App = () => {

  //https://syncwith.com/yahoo-finance/yahoo-finance-api
  // https://stackoverflow.com/a/64641435

  return (
    <div className="App">
      <Stocks ticker="IWDA"/>
    </div>
  );
}

export default App;

const Stocks = (props) => {

    const [stockData, setStockData] = useState(null)

    useEffect(() => {
      fetch('/finance/quote?symbols=IWDA.AS')
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          setStockData(data)
        }).catch((err) => { console.log(err.message) })
    })

    return (<div>
      <h1>Welcome to the stocks app</h1>
      <ul>
        <li>Stock {props.ticker} { stockData ? stockData.quoteResponse.result[0].regularMarketPrice : ""}</li>
      </ul>
    </div>
    )
}


class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>Name: <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    )
  }

}