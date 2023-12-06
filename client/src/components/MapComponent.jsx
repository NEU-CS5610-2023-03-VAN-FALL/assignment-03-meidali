import React from 'react';
import GoogleMapReact from 'google-map-react';
import LocationPin from '../components/LocationPin'
import '../style/map.css';

const MapComponent = ({ location, zoomLevel }) => {
  return (
    <div className="map-container">
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyCtLQfMeywuoN7XL5w7JnkJI1Q9jQnTwAI' }}
        defaultCenter={location}
        defaultZoom={zoomLevel}
      >
       <LocationPin
        lat={location.lat}
        lng={location.lng}
        text={location.address}
      />
      </GoogleMapReact>
    </div>
  );
};

export default MapComponent;
