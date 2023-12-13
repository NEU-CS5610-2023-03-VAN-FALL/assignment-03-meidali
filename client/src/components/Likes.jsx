import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Likes = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [likedItems, setLikedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchLikedItems();
        }
    }, [isAuthenticated]);

    const fetchLikedItems = async () => {
        setIsLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/likes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch liked items');
            }

            const data = await response.json();
            setLikedItems(data);
        } catch (error) {
            console.error('Error fetching liked items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Liked Items</h2>
            {isLoading ? <p>Loading...</p> : (
                <ul>
                    {likedItems.map(like => (
                        <li key={like.menuItem.id}>{like.menuItem.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Likes;
