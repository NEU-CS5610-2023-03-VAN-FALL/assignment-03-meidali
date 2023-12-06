import React, { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import { useAuthToken } from '../AuthTokenContext';
import '../style/detail.css';

const Detail = () => {
    const { orderId } = useParams();
    const { accessToken } = useAuthToken();
    const [orderDetails, setOrderDetails] = useState(null);
    const [editableUserName, setEditableUserName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [editedOrder, setEditedOrder] = useState({ orderItems: [] });

    useEffect(() => {
        if (orderDetails) {
            setEditedOrder({
                ...orderDetails,
            });
        }
    }, [orderDetails]);

    const handleInputChange = (event, itemIndex = null, fieldName = null) => {
        if (itemIndex !== null && fieldName) {
            const updatedItems = [...editedOrder.orderItems];
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], [fieldName]: event.target.value };
            setEditedOrder({ ...editedOrder, orderItems: updatedItems });
        } else {
            setEditedOrder({ ...editedOrder, [event.target.name]: event.target.value });
        }
    };


    useEffect(() => {
        const fetchOrderDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/order-history/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const data = await response.json();
                setOrderDetails(data);
                setEditableUserName(data.user?.name); 
            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, accessToken]);

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/order-history/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(editedOrder),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update order');
            }
    
            console.log('Order updated successfully');
        } catch (e) {
            setError(e.message);
            console.error('Error updating order:', e);
        }
    };

    const handleItemChange = (index, event) => {
        const newItems = [...editedOrder.orderItems];
        newItems[index] = { ...newItems[index], [event.target.name]: event.target.value };
        setEditedOrder({ ...editedOrder, orderItems: newItems });
    };
    

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
           <h2 className="detail-header">Order Details</h2>
            {orderDetails && (
                <div>
                    <p className="detail-info"><strong>User ID:</strong> {orderDetails.userId}</p>
                    <p className="detail-info"><strong>User Name:</strong> {orderDetails.user?.name}</p>
                    <p className="detail-info"><strong>Order ID:</strong> {orderDetails.id}</p>
                    <p className="detail-info"><strong>Created Time:</strong> {new Date(orderDetails.createdTime).toLocaleString()}</p>
                    <h3>Ordered Items:</h3>
                    <ul className="ordered-items">
                        {orderDetails.orderItems.map((item, index) => (
                            <li key={index}>{item.menuItem.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Detail;
