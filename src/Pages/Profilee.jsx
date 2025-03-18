import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCamera, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = "http://localhost:8080";

const Profilee = () => {
    const [userData, setUserData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [imagePicker, setImagePicker] = useState(null);
    const [error, setError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
          const fetchData = async () => {
         const userId = localStorage.getItem("userId") || "1";
         if (!userId) {
        setError("No user ID found.");
        return;
         }

         try {
        const userResponse = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
       method: "GET",
       headers: { "Content-Type": "application/json" },
        });
        if (!userResponse.ok) {
       throw new Error(`Failed to fetch user data. Status: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        setUserData(userData);

        const profileResponse = await fetch(`${API_BASE_URL}/api/user-profile/${userId}`, {
       method: "GET",
       headers: { "Content-Type": "application/json" },
        });
        if (!profileResponse.ok) {
       throw new Error(`Failed to fetch profile data. Status: ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        setProfileData(profileData);

        setEditedData({
       name: userData.name || '',
       email: userData.email || '',
       role: userData.role || '',
       restaurantName: profileData.restaurantName || "",
       restaurantImage: profileData.restaurantImage || "https://via.placeholder.com/200",
       pickupAddress: profileData.pickupAddress || "",
       contactNumber: profileData.contactNumber || "",
       profileImage: profileData.profileImage || "https://via.placeholder.com/150",
        });
         } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
         }
          };
          fetchData();
    }, []);

    const handleChange = (e) => setEditedData({ ...editedData, [e.target.name]: e.target.value });

    const handleImageChange = (type) => (e) => {
          const file = e.target.files?.[0];
          if (file) {
         const reader = new FileReader();
         reader.onload = (event) => setEditedData({ ...editedData, [type]: event.target.result });
         reader.readAsDataURL(file);
          }
          setImagePicker(null);
    };

    const saveProfile = async () => {
          const userId = localStorage.getItem("userId") || "1";
          try {
         console.log("Updating user data with:", { name: editedData.name, email: editedData.email });
         const userUpdateResponse = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
       name: editedData.name,
       email: editedData.email,
        }),
         });
         if (!userUpdateResponse.ok) {
        const errorText = await userUpdateResponse.text();
        throw new Error(`Failed to update user data. Status: ${userUpdateResponse.status}. Response: ${errorText}`);
         }
         const updatedUserData = await userUpdateResponse.json();
         setUserData(updatedUserData);

         const profilePayload = {
        restaurantName: editedData.restaurantName,
        restaurantImage: editedData.restaurantImage,
        pickupAddress: editedData.pickupAddress,
        contactNumber: editedData.contactNumber,
        profileImage: editedData.profileImage,
         };
         console.log("Updating profile data with:", profilePayload);
         const profileUpdateResponse = await fetch(`${API_BASE_URL}/api/user-profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
         });
         if (!profileUpdateResponse.ok) {
        const errorText = await profileUpdateResponse.text();
        throw new Error(`Failed to update profile data. Status: ${profileUpdateResponse.status}. Response: ${errorText}`);
         }
         const updatedProfileData = await profileUpdateResponse.json();
         setProfileData(updatedProfileData);

         setIsEditing(false);
          } catch (err) {
         setError(err.message);
         console.error("Save profile error:", err);
          }
    };

    const toggleEdit = () => {
          if (isEditing) {
         saveProfile();
          } else {
         setEditedData({
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || '',
        restaurantName: profileData.restaurantName || "",
        restaurantImage: profileData.restaurantImage || "https://via.placeholder.com/200",
        pickupAddress: profileData.pickupAddress || "",
        contactNumber: profileData.contactNumber || "",
        profileImage: profileData.profileImage || "https://via.placeholder.com/150",
         });
         setIsEditing(true);
          }
    };

    const handleLogout = () => {
          localStorage.removeItem("userId");
          navigate('/auth');
    };

    const toggleDarkMode = () => {
          setIsDarkMode(!isDarkMode);
    };

    const fields = [
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Pickup Address', name: 'pickupAddress', type: 'text' },
          { label: 'Contact Number', name: 'contactNumber', type: 'tel' },
    ];

    if (error) {
          return (
         <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`text-red-500 text-center ${isDarkMode ? 'dark:text-red-400' : ''}`}>
       {error}
        </div>
         </div>
          );
    }

    if (!userData || !profileData) {
          return (
         <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`text-center ${isDarkMode ? 'dark:text-white' : 'text-gray-900'}`}>
       Loading...
        </div>
         </div>
          );
    }

    return (
          <div className={`min-h-screen flex items-center justify-center transition-all duration-300  ${
         isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50'
          } last:mb-16`}>
         <div className={`w-full max-w-md rounded-2xl shadow-lg p-6 transition-all duration-300 ${
        isDarkMode 
       ? 'bg-gray-800 text-white' 
       : 'bg-white text-gray-900'
         }`}>
        <div className="mb-6">
       <h1 className="text-3xl font-bold text-center">User Profile</h1>
        </div>

        <div className="text-center mb-4">
       <div className="relative">
           <img
          src={isEditing ? editedData.profileImage : profileData.profileImage || "https://via.placeholder.com/150"}
          alt="Profile"
          className="mx-auto w-28 h-28 rounded-full border-4 border-orange-200 shadow-md object-cover"
           />
           {isEditing && (
          <button
         onClick={() => setImagePicker('profileImage')}
         className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow-md hover:bg-purple-600 transition-all"
          >
         <FontAwesomeIcon icon={faCamera} />
          </button>
           )}
       </div>
       {isEditing ? (
           <input
          name="name"
          value={editedData.name}
          onChange={handleChange}
          className={`w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center ${
         isDarkMode 
        ? 'bg-gray-700 border-gray-600 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
          }`}
           />
       ) : (
           <h2 className="text-2xl font-bold mt-2">{userData.name}</h2>
       )}
       <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userData.role}</p>
        </div>

        <div className="text-center mb-4">
       <div className="relative">
           <img
          src={isEditing ? editedData.restaurantImage : profileData.restaurantImage || "https://via.placeholder.com/200"}
          alt="Restaurant"
          className="mx-auto w-44 h-24 rounded-xl border-2 border-orange-200 shadow-md object-cover"
           />
           {isEditing && (
          <button
         onClick={() => setImagePicker('restaurantImage')}
         className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow-md hover:bg-purple-600 transition-all"
          >
         <FontAwesomeIcon icon={faCamera} />
          </button>
           )}
       </div>
       {isEditing ? (
           <input
          name="restaurantName"
          value={editedData.restaurantName}
          onChange={handleChange}
          className={`w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center ${
         isDarkMode 
        ? 'bg-gray-700 border-gray-600 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
          }`}
           />
       ) : (
           <h3 className="text-xl font-semibold mt-1">{profileData.restaurantName || "Not set"}</h3>
       )}
       <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Restaurant</p>
        </div>

        <div className="space-y-3 mb-4">
       {fields.map(({ label, name, type }) => (
           <div key={name} className={`p-3 rounded-lg shadow-sm ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
           }`}>
          <label className={`block text-sm font-medium ${
         isDarkMode ? 'text-gray-300' : 'text-gray-600'
          } mb-1`}>{label}</label>
          {isEditing ? (
         <input
        type={type}
        name={name}
        value={editedData[name]}
        onChange={handleChange}
        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
       isDarkMode 
           ? 'bg-gray-600 border-gray-500 text-white' 
           : 'bg-white border-gray-200 text-gray-900'
        }`}
         />
          ) : (
         <p className={`text-lg font-medium ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
         }`}>
        {name === 'email' ? userData[name] : profileData[name] || "Not set"}
         </p>
          )}
           </div>
       ))}
        </div>

        <div className="space-y-3 mb-4">
       {isEditing ? (
           <div className="flex justify-center gap-3">
          <button
         className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all duration-300"
         onClick={toggleEdit}
          >
         Save
          </button>
          <button
         className={`py-2 px-4 rounded-lg shadow-md hover:bg-opacity-80 transition-all duration-300 ${
        isDarkMode 
       ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
       : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
         }`}
         onClick={() => setIsEditing(false)}
          >
         Cancel
          </button>
           </div>
       ) : (
           <>
          <button
         className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-purple-600 transition-all duration-300"
         onClick={toggleEdit}
          >
         <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit Profile
          </button>
          <button
         onClick={toggleDarkMode}
         className={`w-full py-2 px-4 rounded-lg shadow-md hover:opacity-80 transition-all duration-300 ${
        isDarkMode 
       ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
       : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
         }`}
          >
         <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
         {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
           </>
       )}
        </div>

        <div className="flex justify-center">
       <button
           className="w-full bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
           onClick={handleLogout}
       >
           Logout
       </button>
        </div>

        {imagePicker && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
           <div className={`p-4 rounded-xl shadow-2xl w-80 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
           }`}>
          <h3 className="text-lg font-semibold mb-3">
         Upload {imagePicker === 'profileImage' ? 'Profile' : 'Restaurant'} Image
          </h3>
          <input
         type="file"
         accept="image/*"
         onChange={handleImageChange(imagePicker)}
         className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
        isDarkMode 
       ? 'bg-gray-700 border-gray-600 text-white' 
       : 'bg-white border-gray-300 text-gray-800'
         }`}
          />
          <button
         onClick={() => setImagePicker(null)}
         className={`mt-3 w-full py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all ${
        isDarkMode 
       ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
       : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
         }`}
          >
         Cancel
          </button>
           </div>
       </div>
        )}
         </div>
          </div>
    );
};

export default Profilee;