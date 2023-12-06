import React from 'react';
import '../style/home.css';
import MapComponent from './MapComponent';

const HomePage = () => {
  const location = {
    address: 'Bikini Bottom',
    lat: 37.42216,
    lng: -122.08427
  };
  return (
    <div>
      <h1>The Krusty Krab</h1>
      <div className="link-description">
        <p>Part of functions are only availble for logged-in user.</p>
        <strong>Menu:</strong>
        <p>Browse through our extensive list of dishes. Add items to your "like" list.</p>
        <strong>Order History:</strong>
        <p>Keep track of your past orders.</p>
        <strong>Profile:</strong>
        <p> View and edit your personal information. View and edit your liked items.</p>
        <strong>Auth Debugger: </strong>
        <p> Display the authentication token</p>
        <strong>Our Location </strong>
      </div>
      <MapComponent location={location} zoomLevel={17} />
    </div>
  );
};

export default HomePage;