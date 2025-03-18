import React, { useState, useEffect } from "react";
import { 
  FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaBoxOpen, 
  FaEye, FaEyeSlash, FaSearch, FaLeaf, FaExclamationCircle, FaSpinner, FaShoppingBasket 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:8080";

const FindFood = () => {
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [donatedIds, setDonatedIds] = useState(() => {
    return JSON.parse(localStorage.getItem('donatedIds')) || [];
  });
  const [showDonateModal, setShowDonateModal] = useState(false); // State for popup visibility
  const [currentOrderIndex, setCurrentOrderIndex] = useState(null); // Track the order being donated

  const fetchCompletedPickups = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup/completed`);
      if (response.ok) {
        const items = await response.json();
        const filteredItems = items.filter(item => !donatedIds.includes(item.id));
        setNearbyOrders(filteredItems);
        setFilteredOrders(filteredItems);
        localStorage.setItem('findFoodCardCount', filteredItems.length.toString());
        setShowDetails({}); // Reset to ensure no stale indices
      } else {
        console.error("Failed to fetch completed pickups:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching completed pickups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedPickups();
    const interval = setInterval(fetchCompletedPickups, 100000);
    return () => clearInterval(interval);
  }, [donatedIds]);

  useEffect(() => {
    localStorage.setItem('donatedIds', JSON.stringify(donatedIds));
  }, [donatedIds]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = nearbyOrders.filter((order) => 
      order.location.toLowerCase().includes(query) && !donatedIds.includes(order.id)
    );
    setFilteredOrders(filtered);
    localStorage.setItem('findFoodCardCount', filtered.length.toString());
    setShowDetails({}); // Reset to avoid index misalignment
  };

  const toggleDetails = (index) => {
    setShowDetails(prev => {
      const newState = { ...prev, [index]: !prev[index] };
      console.log(`Toggling details for index ${index}, new state:`, newState);
      return newState;
    });
  };

  const handleDonated = (index) => {
    const order = filteredOrders[index];
    if (!order) return;

    setDonatedIds(prev => [...prev, order.id]);
    
    const updatedOrders = nearbyOrders.filter(o => o.id !== order.id);
    setNearbyOrders(updatedOrders);
    const filtered = updatedOrders.filter((o) => 
      o.location.toLowerCase().includes(searchQuery) && !donatedIds.includes(o.id)
    );
    setFilteredOrders(filtered);
    
    setShowDetails(prev => {
      const newShowDetails = {};
      Object.keys(prev).forEach(key => {
        const numKey = Number(key);
        if (numKey < index) {
          newShowDetails[numKey] = prev[numKey];
        } else if (numKey > index) {
          newShowDetails[numKey - 1] = prev[numKey];
        }
      });
      return newShowDetails;
    });

    localStorage.setItem('findFoodCardCount', updatedOrders.length.toString());

    const currentStats = JSON.parse(localStorage.getItem('foodHomeStats')) || {
      foodItems: 0,
      donationsMade: 0,
      mealsServed: 0,
      livesSaved: 0,
      foodBanksSupported: 0,
      surplusSaved: 0,
      nearbyShares: 0,
      availablePickups: 0,
    };

    const quantity = parseInt(order.quantity) || 1;
    const updatedStats = {
      ...currentStats,
      foodItems: currentStats.foodItems + 1,
      mealsServed: currentStats.mealsServed + quantity,
      livesSaved: currentStats.livesSaved + (quantity * 3),
      surplusSaved: currentStats.surplusSaved + quantity,
    };
    localStorage.setItem('foodHomeStats', JSON.stringify(updatedStats));

    const donatedHistory = JSON.parse(localStorage.getItem('donatedHistory')) || [];
    donatedHistory.push({ ...order, donatedDate: new Date().toISOString() });
    localStorage.setItem('donatedHistory', JSON.stringify(donatedHistory));

    window.dispatchEvent(new CustomEvent('localStorageUpdate', { detail: { type: 'donated' } }));
  };

  // Function to show the popup when "Donated" is clicked
  const confirmDonation = (index) => {
    setCurrentOrderIndex(index);
    setShowDonateModal(true);
  };

  // Handle "Yes" in the popup
  const handleConfirmYes = () => {
    if (currentOrderIndex !== null) {
      handleDonated(currentOrderIndex);
    }
    setShowDonateModal(false);
    setCurrentOrderIndex(null);
  };

  // Handle "No" in the popup
  const handleConfirmNo = () => {
    setShowDonateModal(false);
    setCurrentOrderIndex(null);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-yellow-100 last:mb-12">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl font-extrabold text-center mb-8 text-green-800 flex items-center justify-center gap-3"
      >
        <FaShoppingBasket /> Find Available Food
      </motion.h1>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-500 to-yellow-500 p-6 rounded-xl text-white text-center max-w-lg mx-auto mb-8 shadow-2xl"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-3">
          <FaLeaf className="animate-pulse" /> Food is ready to Donate
        </h2>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-10 max-w-md mx-auto"
      >
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by location..."
            className="w-full p-4 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-green-500 shadow-lg transition-all duration-300"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </motion.div>
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 flex items-center justify-center gap-2"
        >
          <FaSpinner className="animate-spin text-2xl" /> Finding food...
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto min-h-[calc(100vh-300px)]">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-fit relative max-w-sm w-full min-h-[300px]"
              >
                <div className="md:flex-row justify-between gap-3">
                  <div className="flex-1 md:pr-6">
                    <div className="flex items-center mb-4">
                      <FaUtensils className="text-xl text-green-500 mr-2 animate-pulse" />
                      <h2 className="text-xl font-bold text-gray-800">{order.restaurantName}</h2>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="flex items-center flex-wrap text-lg">
                        <FaBoxOpen className="text-gray-500 mr-3 text-lg" />
                        <span className="font-semibold mr-2">Food:</span>
                        <span>{order.foodType}</span>
                      </p>
                      <p className="flex items-center flex-wrap text-lg">
                        <FaCalendarAlt className="text-gray-500 mr-3 text-lg" />
                        <span className="font-semibold mr-2">Expiry:</span>
                        <span>{order.expiryDate || "Not specified"}</span>
                      </p>
                      <p className="flex items-center flex-wrap text-lg">
                        <FaClock className="text-gray-500 mr-3 text-lg" />
                        <span className="font-semibold mr-2">Pickup:</span>
                        <span>{order.pickupTime || "Not specified"}</span>
                      </p>
                      <p className="flex items-center flex-wrap text-lg">
                        <FaMapMarkerAlt className="text-gray-500 mr-3 text-lg" />
                        <span className="font-semibold mr-2">Location:</span>
                        <span>{order.location}</span>
                      </p>
                    </div>
                    <motion.div layout className="mt-4 mb-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDetails(index)}
                        className="flex items-center justify-center w-32 bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-3 rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition-all duration-300 text-md"
                      >
                        {showDetails[index] ? <FaEyeSlash /> : <FaEye />} <span className="ml-1">Details</span>
                      </motion.button>
                      <AnimatePresence>
                        {showDetails[index] && (
                          <motion.div
                            key={`details-${order.id}`}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-100 px-2 py-3 rounded-lg overflow-hidden mt-3 space-y-4 text-gray-700"
                          >
                            <p className="flex items-center text-md">
                              <FaUser className="text-gray-500 mr-3 text-lg" />
                              <span className="font-medium mr-2">Contact:</span>
                              <span>{order.contactPerson}</span>
                            </p>
                            <p className="flex items-center text-md">
                              <FaPhone className="text-gray-500 mr-3 text-lg" />
                              <span className="font-medium mr-2">Phone:</span>
                              <span>{order.contactNumber}</span>
                            </p>
                            <p className="flex items-center text-md">
                              <FaBoxOpen className="text-gray-500 mr-3 text-lg" />
                              <span className="font-medium mr-2">Qty:</span>
                              <span>{order.quantity} {order.quantityType}</span>
                            </p>
                            {order.storageInstructions && (
                              <div className="mt-2">
                                <p className="font-semibold text-md">Storage Instructions:</p>
                                <p className="text-lg mt-1">{order.storageInstructions}</p>
                              </div>
                            )}
                            {order.notes && (
                              <div className="mt-2">
                                <p className="font-semibold text-md">Additional Notes:</p>
                                <p className="text-lg mt-1">{order.notes}</p>
                              </div>
                            )}
                            {order.image && typeof order.image === 'string' && order.image.trim() !== '' && (
                              <div className="mt-3">
                                <p className="font-semibold text-md text-gray-700">Food Image:</p>
                                <img
                                  src={`data:image/jpeg;base64,${order.image}`}
                                  alt="Food"
                                  className="w-full h-40 object-cover rounded-lg mt-1 shadow-md"
                                  onError={(e) => {
                                    console.error(`Failed to load image for order ${order.id}`);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <div className="md:w-1/3 flex items-center justify-center md:justify-end">
                    {/* Placeholder for vertical ProgressBar in NearByFood, not needed in FindFood */}
                  </div>
                </div>
                <div className="mt-4 w-full">
                  <p className="text-xl font-bold bg-green-100 text-green-800 py-2 rounded-lg border border-green-300 text-center">
                    Status: Available for Dispatch
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmDonation(index)} // Show popup instead of directly donating
                    className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-bold"
                  >
                    Donated
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-gray-600 flex items-center justify-center gap-2"
            >
              <FaExclamationCircle /> No food available to dispatch.
            </motion.div>
          )}
        </div>
      )}

      {/* Popup for donation confirmation */}
      <AnimatePresence>
        {showDonateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-4 rounded-xl shadow-2xl max-w-xs w-full"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-800">
                Confirm Donation
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                Are You Given Food to Someone need this?
              </p>
              <div className="flex justify-around">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleConfirmYes}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  Yes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleConfirmNo}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  No
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindFood;