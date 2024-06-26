import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../UserNavbar';
import UserSidebar from './UserSidebar';

const PremiumDonorList = () => {
  const [premiumDonors, setPremiumDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 2;

  useEffect(() => {
    const fetchPremiumDonors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/donors');
        const data = await response.json();

        if (Array.isArray(data)) {
          setPremiumDonors(data);
        } else {
          setError('Invalid data format. Expected an array.');
        }
      } catch (error) {
        console.error('Error fetching premium donors:', error);
        setError('Unable to fetch premium donors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumDonors();
  }, []); 

  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = premiumDonors.slice(indexOfFirstDonor, indexOfLastDonor);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <UserNavbar/>
      <div className="flex">
        <UserSidebar />

  <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-4">
    <div className="flex items-center justify-between w-full">
      <h2 className="text-xl font-bold text-gray-800">Premium Donor List</h2>
          </div>
          <div className="mt-4 w-full">
            {currentDonors.map((donor) => (
              <div key={donor.premium_donor_id} className="donor-item bg-light-green mb-6 p-4 rounded-lg shadow-md w-full">
                <div className="grid grid-cols-3 gap-4">
                  <div className="donor-image-container">
                    <img
                      src={`http://localhost:5000${donor.profile_picture}`}
                      alt={`${donor.userName} profile`}
                      className="donor-image"
                      style={{ width: '250px', height: '200px', objectFit: 'cover' }}
                      onError={(e) => console.error('Error loading image:', e)}
                    />
                  </div>
                  <div className="donor-info col-span-2">
                    <div className="text-gray font-bold">Name</div>
                    <div>{donor.userName}</div>
                    <div className="text-gray-700 font-bold">Blood Group</div>
                    <div>{donor.userBloodGroup}</div>
                    <div className="text-gray-700 font-bold">Availability</div>
                    <div>{donor.availability}</div>
                    <div className="text-gray-700 font-bold">Address</div>
                    <div>{donor.userAddress}</div>
                    <div className="text-gray-700 font-bold">Last Donation</div>
                    <div>{donor.previous_dontaion}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Link to={`/donors/${donor.premium_donor_id}`}>
                    <button className='bg-pastel-green hover:bg-custom-green text-white font-bold py-2 px-4 rounded' type="button">View Profile</button>
                  </Link>
                  <div>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 w-full">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentDonors.length < donorsPerPage}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumDonorList;
