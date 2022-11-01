import { BASE_URL } from '../config';

export async function create() {
  const result = await fetch(BASE_URL + 'account/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ application_secret: 'mysecret' }),
  });

  if (result.ok) {
    const response = (await result.json()) as AccountCreateResponse;
    const accountUuid = response.account_uuid;
    return accountUuid;
  }
  return undefined;
}

export async function login(accountUuid: string) {
  const result = await fetch(BASE_URL + 'account/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account_uuid: accountUuid }),
  });

  if (result.ok) {
    // TODO is there a way to map snake case to camel case?
    return (await result.json()) as AccessToken;
  }
  return undefined;
}
