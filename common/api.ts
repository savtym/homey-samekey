const BASE_URL = 'https://api.keypass.cloud/api/v1';

type LoginResponse = {
  user: { id: number; role: string };
  // eslint-disable-next-line camelcase
  token: { id: string; expired_at: number };
};

type Device = {
  id: number;
  name: string;
  created: string;
  // eslint-disable-next-line camelcase
  last_open: string;
};

export default class Api {
  email?: string;
  token?: string;
  password?: string;

  constructor({ email, token, password }: { email?: string; token?: string; password?: string }) {
    this.email = email;
    this.token = token;
    this.password = password;
  }

  setCredentials(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  async login() {
    if (!this.email || !this.password) {
      throw new Error('Email and password are required');
    }

    const formData = new FormData();

    formData.append('email', this.email);
    formData.append('password', this.password);

    const response = await fetch(`${BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const { data } = (await response.json()) as { data: LoginResponse };

    this.token = data.token.id;

    return data;
  }

  async getDevices() {
    const formData = new FormData();

    formData.append('page', '1');
    formData.append('per_page', '20');

    const response = await fetch(`${BASE_URL}/door/list`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }

    const { data } = (await response.json()) as { data: { list: Device[] } };
    return data.list;
  }

  async openDoor(doorId: number, token: string) {
    const formData = new FormData();

    formData.append('token', token);
    formData.append('door', doorId.toString());

    const response = await fetch(`${BASE_URL}/guest/door/open`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to open door');
    }

    const resp = await response.json();
    return resp;
  }
}
