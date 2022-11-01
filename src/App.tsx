import React, { useState } from 'react';
import Account from './account';
import Stocks from './stocks';

const App = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  return (
    <>
      {loggedIn === true ? (
        <Stocks />
      ) : (
        <Account
          setLoggedIn={(l: boolean) => {
            setLoggedIn(l);
          }}
        />
      )}
    </>
  );
};

export default App;
