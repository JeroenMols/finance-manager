import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './App';

console.log(`

          __                            
         / /__  _________  ___  ____    
    __  / / _ \\/ ___/ __ \\/ _ \\/ __ \\   
   / /_/ /  __/ /  / /_/ /  __/ / / /  
   \\____/\\___/_/   \\____/\\___/_/ /_/

Built by Jeroen Mols
Checkout his portfolio at https://jeroenmols.com

`);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
