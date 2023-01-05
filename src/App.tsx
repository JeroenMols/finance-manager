import React, { useState } from 'react';
import Account from './account';
import { AccessToken } from './account/models';
import PortfolioOverview from './stocks';

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
        <PortfolioOverview accessToken={accessToken} />
      )}
    </>
  );
};

export default App;
