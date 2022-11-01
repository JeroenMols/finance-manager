import React, { useState } from 'react';
import Account from './account';
import Stocks from './stocks';

const App = () => {
  const [accessToken, setAccessToken] = useState<AccessToken>();

  return (
    <>
      {accessToken === undefined ? (
        <Account
          setAccessToken={(token: AccessToken) => {
            setAccessToken(token);
          }}
        />
      ) : (
        <Stocks accessToken={accessToken} />
      )}
    </>
  );
};

export default App;
