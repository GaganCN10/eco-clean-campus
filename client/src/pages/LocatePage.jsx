import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';

const LocatePage = () => {
  const [dustbins, setDustbins] = useState([
    { id: '1', lat: 12.9716, lng: 77.5946, name: 'Main Gate', status: 'available' },
    { id: '2', lat: 12.9730, lng: 77.5950, name: 'Student Center', status: 'full' },
    { id: '3', lat: 12.9700, lng: 77.5960, name: 'Library Entrance', status: 'available' }
  ]);

  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watcherIdRef = useRef(null);
  const dustbinsRef = useRef(dustbins);

  useEffect(() => {
    AOS.init();
    const initMap = () => {
      // initialize map once
      mapRef.current = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 15,
      });

      // prepare SVG icons for Google Maps markers (available=green, full=red)
  const availableIcon = { url: '/icons/dustbin-available-icon.svg', scaledSize: new window.google.maps.Size(36, 48) };
  const fullIcon = { url: '/icons/dustbin-full-icon.svg', scaledSize: new window.google.maps.Size(36, 48) };

      // add static markers for dustbins using appropriate icon
      dustbinsRef.current.forEach(db => {
        new window.google.maps.Marker({
          position: { lat: db.lat, lng: db.lng },
          map: mapRef.current,
          title: db.name,
          icon: db.status === 'available' ? availableIcon : fullIcon,
        });
      });

  // user location icon: use same red pin as full dustbin (URL)
  const userIcon = { url: '/icons/user-location.svg', scaledSize: new window.google.maps.Size(36, 48) };

      if (navigator.geolocation) {
        watcherIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            mapRef.current.setCenter(pos);

            if (!userMarkerRef.current) {
              userMarkerRef.current = new window.google.maps.Marker({
                position: pos,
                map: mapRef.current,
                title: 'Your Location',
                icon: userIcon
              });
            } else {
              userMarkerRef.current.setPosition(pos);
            }

            // update distances using the ref to avoid stale closure
            setDustbins(prev => {
              const updated = dustbinsRef.current.map(db => ({
                ...db,
                distance: calculateDistance(pos.lat, pos.lng, db.lat, db.lng)
              })).sort((a, b) => a.distance - b.distance);
              return updated;
            });
          },
          (err) => {
            console.warn('Geolocation error:', err);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    };

    initMap();
  }, []);

  // keep dustbinsRef up-to-date
  useEffect(() => {
    dustbinsRef.current = dustbins;
  }, [dustbins]);

  // cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watcherIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watcherIdRef.current);
      }
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl" data-aos="fade-down">Locate Nearest Dustbins</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4" data-aos="fade-down" data-aos-delay="100">Find nearby dustbins in real-time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg shadow-lg bg-white p-6" data-aos="fade-right">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Live Map</h2>
            <div id="map" className="map-container"></div>
          </div>
          <div className="rounded-lg shadow-lg bg-white p-6" data-aos="fade-left" data-aos-delay="200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dustbin List</h2>
            <div className="space-y-4">
              {dustbins.map(dustbin => (
                <div key={dustbin.id} className="bg-white shadow rounded-lg p-4 flex items-start distance-indicator">
                  <div className={`flex-shrink-0 ${dustbin.status === 'available' ? 'bg-green-100' : 'bg-red-100'} rounded-md p-2 mr-4`}>
                    <i data-feather="trash-2" className={`h-5 w-5 ${dustbin.status === 'available' ? 'text-green-600' : 'text-red-600'}`}></i>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{dustbin.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center">
                        <i data-feather="map-pin" className="h-3 w-3 mr-1"></i>
                        {dustbin.distance < 1000 ? `${Math.round(dustbin.distance)} m away` : `${(dustbin.distance / 1000).toFixed(1)} km away`}
                      </span>
                    </p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dustbin.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dustbin.status === 'available' ? 'Available' : 'Full'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocatePage;