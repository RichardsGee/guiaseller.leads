import { create } from 'zustand';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authAPI } from '../services/api';

const googleProvider = new GoogleAuthProvider();

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  devLogin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User, token: string) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  // Validate stored token on app start
  initializeAuth: async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      set({ isInitializing: false, isAuthenticated: false });
      return;
    }

    try {
      // Validate token with backend
      const response = await authAPI.me();
      const user = response.data.user;

      set({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.email.split('@')[0],
          lastName: user.lastName || '',
          avatar: user.avatar || null,
          role: user.role,
          permissions: user.permissions || [],
        },
        token: storedToken,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      // Token expired or invalid — clear and require re-login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Sign in with Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      // 2. Exchange for JWT
      const response = await authAPI.signin(idToken);
      const { token, user } = response.data;

      // 3. Store and update state
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Google sign-in
  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();

      const response = await authAPI.signin(idToken);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Dev-only login (no Firebase needed)
  devLogin: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.devLogin(email);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Dev login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore Firebase signout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  clearError: () => set({ error: null }),

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  },

  hasRole: (...roles: string[]) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
