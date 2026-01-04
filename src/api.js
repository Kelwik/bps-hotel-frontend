import { tokenStore } from './token';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenStore.get();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Helpers to avoid multiple request
let isRefreshing = false;
let queue = [];

//Function to retry all the request when the new accesstoken arrive or fail all of them
function processQueue(error, token) {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  //after all request is finished we empty the array again
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/auth/refresh')
    ) {
      originalRequest.retry = false;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              originalRequest.headers.authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }
      isRefreshing = true;

      try {
        const res = await api('/auth/refresh');
        const newAccessToken = res.data.accessToken;
        tokenStore.set(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        window.location.href = '/login';

        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
