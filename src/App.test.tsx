import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import store from './store';
import App from './App';
import api from './api';
import Cookies from 'js-cookie';
import { login, logout } from './slices/authSlice';

beforeEach(() => {
  jest.restoreAllMocks();
  Cookies.remove('access');
  Cookies.remove('refresh');
  store.dispatch(logout());
});

test('redirects unauthenticated users to login and returns them to their requested page', async () => {
  const access = `header.${btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    username: 'admin',
    role: 'admin',
  }))}.signature`;
  jest.spyOn(api, 'post').mockResolvedValue({ data: { access, refresh: 'refresh-token' } } as any);
  jest.spyOn(api, 'get').mockResolvedValue({
    data: {
      total_uploads: 4,
      total_clips: 12,
      total_downloads: 3,
      active_tags: 2,
      top_tags: [{ tag_name: 'Local', clip_count: 5 }],
    },
  } as any);

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin-dashboard']}>
        <App />
      </MemoryRouter>
    </Provider>
  );

  fireEvent.change(await screen.findByLabelText(/Username/i), { target: { value: 'admin' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
  expect(await screen.findByText('Total uploads')).toBeInTheDocument();
});

test('sends authenticated visits to login to the dashboard', async () => {
  store.dispatch(login({ username: 'admin', role: 'admin' }));

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </Provider>
  );

  expect(await screen.findByText(/Welcome to the E-Newspaper Clipping & Tagging Platform/)).toBeInTheDocument();
});

test('renders aggregate dashboard statistics without assuming an array response', async () => {
  store.dispatch(login({ username: 'admin', role: 'admin' }));
  jest.spyOn(api, 'get').mockResolvedValue({
    data: {
      total_uploads: 4,
      total_clips: 12,
      total_downloads: 3,
      active_tags: 2,
      top_tags: [{ tag_name: 'Local', clip_count: 5 }],
    },
  } as any);

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin-dashboard']}>
        <App />
      </MemoryRouter>
    </Provider>
  );

  expect(await screen.findByText('Total uploads')).toBeInTheDocument();
  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByText('Local: 5 clips')).toBeInTheDocument();
});
