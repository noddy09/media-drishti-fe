import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import store from './store';
import App from './App';

test('renders login page when unauthenticated', () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </Provider>
  );
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
