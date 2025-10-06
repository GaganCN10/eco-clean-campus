import React, { useState } from 'react';
import api from '../utils/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

const WasteReportPage = () => {
  const [position, setPosition] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
      },
    });
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      toast.error('Please select a location on the map.');
      return;
    }

    const formData = new FormData();
    formData.append('lat', position.lat);
    formData.append('lng', position.lng);
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      await api.post('/api/waste-reports', {
        lat: position.lat,
        lng: position.lng,
        description,
        photoUrl: '' // In a real app, you'd upload the photo and get a URL here
      });
      toast.success('Waste report submitted successfully!');
      setPosition(null);
      setDescription('');
      setPhoto(null);
    } catch (error) {
      toast.error('Failed to submit report.');
      console.error(error);
    }
  };

  const wasteIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Report Waste Location</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="md:h-96 h-64 rounded-xl shadow-lg overflow-hidden">
          <MapContainer
            center={[12.9221, 74.8560]} // Default to a central campus location
            zoom={16}
            scrollWheelZoom={true}
            className="leaflet-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler />
            {position && (
              <Marker position={position} icon={wasteIcon}>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Location Coordinates</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={position?.lat || ''}
                  readOnly
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={position?.lng || ''}
                  readOnly
                  className="w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="e.g., 'Overflowing dustbin near the cafeteria'"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="photo" className="block text-gray-700 font-medium mb-2">
                Photo (Optional)
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full text-gray-700"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-emerald-700 transition-colors"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WasteReportPage;