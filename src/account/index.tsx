import { create, login } from './repository';
import React, { useState } from 'react';
import { log } from '../utilities/log';
import { useCookies } from 'react-cookie';
import { AccessToken } from './models';

const Account = (props: { setAccessToken: (token: AccessToken) => void }) => {
  const [accountUuid, setAccountUuid] = useState<string>('');
  const [newAccountUuid, setNewAccountUuid] = useState<string>();
  const [cookie, setCookie, removeCookie] = useCookies(['account']);

  const createAccount = () => {
    log('creating new user account');
    create().then((accountId) => {
      if (accountId === undefined) {
        alert('Failed to create a new account');
      }
      setNewAccountUuid(accountId);
    });
  };
  const loginAccount = () => {
    log('logging in');
    login(accountUuid).then((tokenResponse) => {
      if (tokenResponse === undefined) {
        alert('Failed to log in');
      } else {
        setCookie('account', tokenResponse);
        props.setAccessToken(tokenResponse);
      }
    });
  };

  if (cookie.account !== undefined) {
    const accessToken = cookie.account as AccessToken;
    const expiration = Date.parse(accessToken.expiration_date);

    if (Date.now() > expiration) {
      // TODO handle auto login case
      log('access token expired - logging out');
      removeCookie('account');
    } else {
      props.setAccessToken(accessToken);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 1000,
      }}
    >
      <h1>Welcome to the stocks app</h1>
      <div
        style={{
          width: '90%',
          maxWidth: 600,
          borderStyle: 'solid',
          borderColor: '#B0BEC5',
          borderWidth: '1px',
          borderRadius: 10,
          background: '#ECEFF1',
          padding: 50,
        }}
      >
        <h3>Please enter your account id to continue.</h3>
        <input
          style={{
            marginRight: 20,
            padding: 5,
            width: '60%',
          }}
          type="text"
          placeholder="account id"
          value={accountUuid}
          onChange={(e) => {
            setAccountUuid(e.target.value);
          }}
        />
        <button style={{ padding: 5, paddingLeft: 40, paddingRight: 40 }} onClick={() => loginAccount()}>
          Login
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          width: '90%',
          maxWidth: 600,
          borderStyle: 'solid',
          borderColor: '#B0BEC5',
          borderWidth: '1px',
          borderRadius: 10,
          background: '#ECEFF1',
          padding: 50,
        }}
      >
        <h3>Don`t have an account yet?</h3>
        <p>All accounts are fully anonymous, we don`t ask for any personal information, ever.</p>

        <div
          style={{
            height: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {newAccountUuid !== undefined ? (
            <p style={{ textAlign: 'center', margin: 30 }}>{newAccountUuid}</p>
          ) : (
            <button
              style={{ padding: 5, paddingLeft: 40, paddingRight: 40, margin: 30 }}
              onClick={() => createAccount()}
            >
              Create account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
