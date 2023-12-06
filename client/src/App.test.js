import React from 'react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { render, waitFor, fireEvent} from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthToken } from './AuthTokenContext';
import HomePage from './components/HomePage';
import Menu from './components/Menu';
import OrderHistory from './components/OrderHistory';

test('renders HomePage component correctly', () => {
  const { getByText } = render(<HomePage />);
  expect(getByText(/The Krusty Krab/i)).toBeInTheDocument();
});

jest.mock('@auth0/auth0-react');
describe('Menu Component', () => {
  test('handleLike function', async () => {
    // Mocks and setup...
    const loginWithRedirect = jest.fn();
    const getAccessTokenSilently = jest.fn(() => Promise.resolve('fake_token'));
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect,
      getAccessTokenSilently,
    });

    global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Test Item', description: 'Test Description' }]), // Mock response for menu items
    })
  );
  const { findByText } = render(<Menu />);
  const likeButton = await findByText('Like');
  fireEvent.click(likeButton);
    await waitFor(() => {
      expect(getAccessTokenSilently).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/api/like`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer fake_token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItemId: 1 }),
      });
    });
  });
});

jest.mock('@auth0/auth0-react');
jest.mock('./AuthTokenContext');
const ordersMock = [
  { id: 1, createdTime: new Date().toISOString() },
  { id: 2, createdTime: new Date().toISOString() },
];

describe('OrderHistory Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, createdTime: '2021-01-01T00:00:00Z' }]), // Mock order history data
      })
    );

    useAuth0.mockReturnValue({
      isAuthenticated: true,
      getAccessTokenSilently: () => Promise.resolve('fake_token'),
    });

    useAuthToken.mockReturnValue({
      accessToken: 'fake_token',
    });
  });

  it('deletes an order when delete button is clicked', async () => {
    const { getByText } = render(
      <BrowserRouter>
        <OrderHistory />
      </BrowserRouter>
    );
    await waitFor(() => {
      const deleteButton = getByText('Delete');
      fireEvent.click(deleteButton);
    });
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/order-history/1`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer fake_token',
          },
        }
      );
    });
  });
});