import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
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
