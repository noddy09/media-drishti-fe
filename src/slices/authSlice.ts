import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: null | { username: string; role: string };
  accessToken?: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ username: string; role: string; accessToken?: string }>) {
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = { username: action.payload.username, role: action.payload.role };
      state.accessToken = action.payload.accessToken || null;
    },
    finishInitialization(state) {
      state.isInitialized = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.user = null;
      state.accessToken = null;
      Cookies.remove('access');
      Cookies.remove('refresh');
    },
  },
});

export const { login, logout, finishInitialization } = authSlice.actions;
export default authSlice.reducer;
