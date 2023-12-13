import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/layout.css';

const Layout = ({ children }) => {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const navigate = useNavigate();

    const handleLogin = () => {
        loginWithRedirect();
    };

    const handleLogout = () => {
        logout({ returnTo: window.location.origin });
    };

    const handleSignUp = () => loginWithRedirect({ screen_hint: "signup" });

    return (
        <div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/menu">Menu</Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/order-history">Order History</Link>
                        <Link to="/profile">Profile</Link>
                        <Link to="/auth-debugger">Auth Debugger</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleLogin}>Login</button>
                        <button onClick={handleSignUp}>Register</button>
                    </>
                )}
            </nav>
            <main>{children}</main>
        </div>
    );
};

export default Layout;
