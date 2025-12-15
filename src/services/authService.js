import api from "./api";
import refreshApi from "./refreshApi";

export const authService = {
  async login(credentials) {
    const response = await api.post('/Auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  },

  async refreshToken(refreshToken) {
    const response = await refreshApi.post('/Auth/refresh', {
      refreshToken
    });
    return response.data;
  }
};
