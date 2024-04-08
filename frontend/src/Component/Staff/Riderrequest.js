import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function RideRequestForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { requestId } = useParams();
  const [destination, setDestination] = useState('');
  const [riderId, setRiderId] = useState('');
  const [riders, setRiders] = useState([]);
  const [donorDetails, setDonorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/bloodbank-riders');
        setRiders(response.data.riders);
      } catch (error) {
        console.error('Error fetching riders:', error);
      }
    };

    fetchRiders();

    const fetchRequestData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/urgentrequests/${requestId}`);
        const requestData = response.data;

        setDestination(requestData.destination);
        setRiderId(requestData.riderId);
      } catch (error) {
        console.error('Error fetching ride request data:', error);
      }
    };

    if (requestId) {
      fetchRequestData();
    }
  }, [requestId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/requestride',
        {
          riderId,
          destination,
          requestId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log(response.data);
      setDonorDetails(response.data.donorDetails);
    } catch (error) {
      console.error('Error posting ride request:', error);
      setError('Error posting ride request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Request Ride</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label htmlFor="destination" className="block text-gray-700 font-bold mb-2">
            Destination:
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="rider" className="block text-gray-700 font-bold mb-2">
            Select Rider:
          </label>
          <select
            id="rider"
            value={riderId}
            onChange={(e) => setRiderId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select Rider</option>
            {riders.map((rider) => (
              <option key={rider.rider_id} value={rider.rider_id}>
                {rider.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Requesting Ride...' : 'Request Ride'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
     
    </div>
  );
}

export default RideRequestForm;