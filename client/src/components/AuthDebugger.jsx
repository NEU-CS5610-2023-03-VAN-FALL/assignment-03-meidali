import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/debugger.css';

const AuthDebugger = () => {
    const { user, getAccessTokenSilently } = useAuth0();
    const [accessToken, setAccessToken] = React.useState('');

    React.useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                setAccessToken(token);
            } catch (error) {
                console.error('Error fetching access token', error);
            }
        };

        fetchAccessToken();
    }, [getAccessTokenSilently]);

    return (
        <div className="auth-debugger">
            <h2>Auth Debugger</h2>
            <h3>User Information:</h3>
            {user && (
                <ul className="user-info-list">
                    <li>Name: {user.name}</li>
                    <li>Email: {user.email}</li>
                    <li>User ID: {user.sub}</li>
                </ul>
            )}
            <h3>Access Token:</h3>
            <textarea 
                readOnly 
                value={accessToken} 
                className="access-token-textarea"
            />
        </div>
    );
};

export default AuthDebugger;
