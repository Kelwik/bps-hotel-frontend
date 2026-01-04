import { tokenStore } from './token';
import { api } from './api';

async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  tokenStore.set(res.data.accessToken);
}

async function logout() {
  await api.post('/auth/logout');
  tokenStore.clear();
}

export { login, logout };
