import React, { useEffect, useState } from 'react';
import { useAuthToken } from '../AuthTokenContext';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import '../style/order.css';

const OrderHistory = () => {
    const { accessToken } = useAuthToken();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    useEffect(() => {
        const fetchOrderHistory = async () => {
            if (!accessToken) return; 

            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/order-history`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setOrders(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderHistory();
    }, [accessToken]);

    const deleteOrder = async (orderId) => {
        if (!isAuthenticated) {
            return;
        }

        const accessToken = await getAccessTokenSilently();
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/order-history/${orderId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setOrders(orders.filter(order => order.id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="order-history">
            <h1>Order History</h1>
            <div>
                {orders.map(order => (
                    <div className="order-item" key={order.id}>
                        <div className="order-item-button">
                        <button onClick={() => deleteOrder(order.id)}>Delete</button>
                        </div>
                        <div className="order-item-header">
                        <Link to={`/order-detail/${order.id}`}>
                            Order ID: {order.id}, Created: {new Date(order.createdTime).toLocaleString()}
                        </Link>
                        </div>
                    
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;

