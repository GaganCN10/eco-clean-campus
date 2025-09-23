import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { admin, isAuthenticated, logout, loading, login } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
     // navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const fetchReports = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:5000/api/admin/reports', {
        headers: {
          'x-auth-token': token
        }
      });
      setReports(res.data);
    } catch (err) {
      toast.error('Failed to fetch reports. Please log in again.');
      console.error(err);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated, fetchReports]);

  const handleMarkAsClean = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/admin/clean/${id}`, {}, {
        headers: {
          'x-auth-token': token
        }
      });
      toast.success('Report marked as clean!');
      fetchReports(); // Refresh the list
    } catch (err) {
      toast.error('Failed to mark as clean.');
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = e.target.elements;
    const res = await login({
      username: username.value,
      password: password.value
    });
    if (res.success) {
      toast.success('Logged in successfully!');
    } else {
      toast.error(res.error || 'Login failed.');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Admin Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="username">Username</label>
            <input type="text" id="username" className="w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
            <input type="password" id="password" className="w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={logout} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
          Logout
        </button>
      </div>
      <p className="text-lg mb-6">Welcome, {admin?.username}!</p>
      
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending Waste Reports</h2>
      
      {reports.length === 0 ? (
        <p className="text-gray-500 italic">No pending waste reports to review.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between waste-report-card">
              <div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">ID:</span> {report._id.substring(0, 8)}...
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Reported By:</span> {report.reportedBy}
                </p>
                {report.photoUrl && (
                  <img src={report.photoUrl} alt="Waste Report" className="w-full h-48 object-cover rounded-md mb-4" />
                )}
                <p className="text-gray-700 font-medium mb-2">
                  <span className="font-semibold">Location:</span> {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
                </p>
                {report.description && (
                  <p className="text-gray-600 mb-4">
                    <span className="font-semibold">Description:</span> {report.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleMarkAsClean(report._id)}
                className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors mt-4"
              >
                Mark as Clean
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;