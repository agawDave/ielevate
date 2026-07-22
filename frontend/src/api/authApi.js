import axiosClient from './axiosClient';

export const login = (email, password) =>
  axiosClient.post('/auth/login', { email, password }).then((r) => r.data);

export const register = (payload) =>
  axiosClient.post('/auth/register', payload).then((r) => r.data);
