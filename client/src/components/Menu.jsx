import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/menu.css';

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/menu-items`)
            .then(response => response.json())
            .then(data => {
                setMenuItems(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching menu items:', error);
                setIsLoading(false);
            });
    }, []);

    const handleOrder = async (menuItemId) => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }
        const accessToken = await getAccessTokenSilently();
        const url = `${process.env.REACT_APP_API_URL}/api/order`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menuItemId })
            });
            if (response.ok) {
                alert("Order successfully!");
            } else {
                console.error('Error order item:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const handleLike = async (menuItemId) => {
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        const accessToken = await getAccessTokenSilently();
        const url = `${process.env.REACT_APP_API_URL}/api/like`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menuItemId }) 

            });
            if (response.ok) {
                alert("Added to your Like List!");
            } else {
                console.error('Error liking menu item:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating like status:', error);
        }
    };


    if (isLoading) return <p>Loading menu items...</p>;

    return (
        <div className="menu-container">
            <h1>Menu</h1>
            <div className="menu-items-grid">
                {menuItems.map(item => (
                    <div className="menu-item" key={item.id}>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>Spicy Level: {item.spicy}</p>
                        <p>{item.veggie ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                        <p>Created: {new Date(item.createdTime).toLocaleString()}</p>
                        <div className="buttons">
                            <button onClick={() => handleLike(item.id)}>Like</button>
                            <button onClick={() => handleOrder(item.id)}>Order</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menu;
