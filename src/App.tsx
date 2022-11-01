import React, { useState } from 'react';
import Account from './account';
import Stocks from './stocks';

const App = () => {
  const [accessToken, setAccessToken] = useState<string>();

  return (
    <>
      {accessToken === undefined ? (
        <Account
          setAccessToken={(token: string) => {
            setAccessToken(token);
          }}
        />
      ) : (
        <Stocks />
      )}
    </>
  );
};

export default App;
