const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

export const authStorage = {
  // Set token
  setToken: (token: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  
  // Get token
  getToken: (): string | null => {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  
  // Set user data
  setUser: (user: any) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  // Get user data
  getUser: (): any | null => {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  // Remove token
  removeToken: () => {
    sessionStorage.removeItem(TOKEN_KEY);
  },
  
  // Remove user
  removeUser: () => {
    sessionStorage.removeItem(USER_KEY);
  },
  
  // Clear all auth data
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem(TOKEN_KEY);
  }
};