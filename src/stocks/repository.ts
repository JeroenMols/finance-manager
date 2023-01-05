import { AccessToken } from '../account/models';
import { BASE_URL } from '../config';
import { Holding, Portfolio } from './models';

// TODO think better about name here: should this be portfolio?
class HoldingRepository {
  private accessToken;

  constructor(accessToken: AccessToken) {
    this.accessToken = { access_token: accessToken.access_token };
  }

  public async get(): Promise<Portfolio | undefined> {
    const result = await fetch(BASE_URL + 'portfolio/get', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...this.accessToken }),
    });

    if (result.ok) {
      return (await result.json()) as Portfolio;
    }
    return undefined;
  }

  public async add(holding: Holding): Promise<Holding[] | undefined> {
    const result = await fetch(BASE_URL + 'holding/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...holding, ...this.accessToken }),
    });

    if (result.ok) {
      const holdings = (await result.json()) as Holding[];
      return holdings;
    }
    return undefined;
  }
}

export default HoldingRepository;
