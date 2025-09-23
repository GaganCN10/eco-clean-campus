import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ReportPage = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    AOS.init();
    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 15,
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            map.setCenter(pos);
          },
          () => {}
        );
      }

      let marker;
      map.addListener('click', (event) => {
        if (marker) {
          marker.setMap(null);
        }
        marker = new window.google.maps.Marker({
          position: event.latLng,
          map: map,
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });
    };
    initMap();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location) {
      alert('Please select a location on the map');
      return;
    }
    console.log('Report submitted:', location);
    alert('Report submitted successfully! Thank you for helping keep our campus clean.');
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl" data-aos="fade-down">Report Waste</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4" data-aos="fade-down" data-aos-delay="100">Help us keep our campus clean by reporting waste.</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden report-card" data-aos="zoom-in">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Details</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-500">Click on the map to select the location of the waste.</p>
                <div id="map" className="map-container mt-2"></div>
                <input type="hidden" name="latitude" value={location?.lat || ''} />
                <input type="hidden" name="longitude" value={location?.lng || ''} />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Upload a Photo (Optional)</label>
                <div className="file-upload relative rounded-md border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>Browse</span>
                  <input id="file-upload" name="file-upload" type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <i data-feather="send" className="h-5 w-5 mr-2"></i>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportPage;