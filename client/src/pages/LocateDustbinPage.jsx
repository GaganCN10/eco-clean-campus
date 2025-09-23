// client/src/pages/LocateDustbinPage.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import toast from 'react-hot-toast';

const LocateDustbinPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [dustbins, setDustbins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearestDustbin, setNearestDustbin] = useState(null);

  useEffect(() => {
    // Get user's current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not retrieve your location. Showing all dustbins.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }

    // Fetch dustbin data from your backend
    const fetchDustbins = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dustbins');
        setDustbins(res.data);
      } catch (err) {
        toast.error('Failed to fetch dustbin locations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDustbins();
  }, []);

  useEffect(() => {
    if (userLocation && dustbins.length > 0) {
      let closestDustbin = null;
      let minDistance = Infinity;

      dustbins.forEach(dustbin => {
        const dustbinLocation = [dustbin.location.coordinates[1], dustbin.location.coordinates[0]];
        const distance = L.latLng(userLocation).distanceTo(dustbinLocation);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestDustbin = dustbin;
        }
      });
      setNearestDustbin({ dustbin: closestDustbin, distance: (minDistance / 1000).toFixed(2) });
    }
  }, [userLocation, dustbins]);

  const LocationMarker = () => {
    useMap().setView(userLocation || [12.31639, 76.61380], 16);
    return userLocation === null ? null : (
      <Marker position={userLocation}>
        <Popup>You are here!</Popup>
      </Marker>
    );
  };

  if (loading) {
    return <div className="text-center py-10">Loading map...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Find Dustbins Near You</h1>
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-[600px] flex flex-col items-center">
        {userLocation && nearestDustbin && (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold text-emerald-600">
              The nearest dustbin is: {nearestDustbin.dustbin.name}
            </h2>
            <p className="text-gray-600">
              Approximately {nearestDustbin.distance} km away.
            </p>
          </div>
        )}
        <div className="w-full h-full">
          <MapContainer
            center={userLocation || [12.31639, 76.61380]}
            zoom={16}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && <LocationMarker />}
            {dustbins.map((dustbin) => (
              <Marker
                key={dustbin._id}
                position={[
                  dustbin.location.coordinates[1],
                  dustbin.location.coordinates[0],
                ]}
              >
                <Popup>
                  <span className="font-semibold">{dustbin.name}</span>
                  <br />
                  <span className="text-sm text-gray-500">
                    Lat: {dustbin.location.coordinates[1].toFixed(5)}, Lon: {dustbin.location.coordinates[0].toFixed(5)}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocateDustbinPage;