import { BASE_URL } from '../config';

class HoldingRepository {
  private accessToken;

  constructor(accessToken: AccessToken) {
    this.accessToken = { access_token: accessToken.access_token };
  }

  public async get(): Promise<Holding[] | undefined> {
    const result = await fetch(BASE_URL + 'holding/get', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...this.accessToken }),
    });

    if (result.ok) {
      const holdings = (await result.json()) as Holding[];
      return holdings;
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
