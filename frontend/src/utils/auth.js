import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('jwtToken');
};

export const setToken = (token) => {
  localStorage.setItem('jwtToken', token);
};

export const removeToken = () => {
  localStorage.removeItem('jwtToken');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getLoggedInUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
};
