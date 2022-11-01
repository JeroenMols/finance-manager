import React, { useState } from 'react';
import Login from './login';
import Stocks from './stocks';

const App = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  return (
    <>
      {loggedIn === true ? (
        <Stocks />
      ) : (
        <Login
          setLoggedIn={(loggedIn: boolean) => {
            setLoggedIn(loggedIn);
          }}
        />
      )}
    </>
  );
};

export default App;
