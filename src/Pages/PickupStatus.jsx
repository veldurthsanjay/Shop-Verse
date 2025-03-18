import React, { useState, useEffect } from "react";
import { FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaBoxOpen, FaEye, FaEyeSlash } from "react-icons/fa";
import ProgressBar from "../components/ProgressBar";
import { motion, AnimatePresence } from "framer-motion";
import fastdelivery from "../Assets/Images/fastdelivery.png";

const API_BASE_URL = "http://localhost:8080";

const PickupStatus = () => {
  const [pickupOrders, setPickupOrders] = useState([]);
  const [showDetails, setShowDetails] = useState({});

  const fetchPickupOrders = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No user ID found");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup/status?userId=${userId}`);
      if (response.ok) {
        const items = await response.json();
        setPickupOrders(items);
      } else {
        console.error("Failed to fetch pickup orders:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching pickup orders:", error);
    }
  };

  useEffect(() => {
    fetchPickupOrders(); 
    const interval = setInterval(fetchPickupOrders, 1000); // Fetch every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Use the same toggleDetails logic as FoodCart
  const toggleDetails = (index) => setShowDetails((prev) => {
    const newState = { ...prev, [index]: !prev[index] };
    console.log(`Toggling index ${index}, new state:`, newState);
    return newState;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-auto last:mb-14">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 drop-shadow-lg"
      >
        Pickup Status
      </motion.h1>

      {pickupOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center"
        >
          <div className="relative mb-8">
            <motion.img
              src={fastdelivery}
              alt="Motorcycle"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-32 h-32 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4 animate-pulse">
            No Food Ready to Pickup Yet! 😢
          </h2>
          <p className="text-lg text-gray-600 max-w-md">
            Share, Care, together, we can end food waste!
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block ml-2"
            >
              ✅
            </motion.span>
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pickupOrders.map((order, index) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-blue-200 transition-all duration-300 flex flex-col h-fit"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <FaUtensils className="text-2xl text-blue-500 mr-3 animate-pulse" />
                    <h2 className="text-xl font-bold text-gray-800">{order.restaurantName}</h2>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center flex-wrap"><FaBoxOpen className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Food:</span> {order.foodType}</p>
                    <p className="flex items-center flex-wrap"><FaCalendarAlt className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Expiry:</span> {order.expiryDate || "Not specified"}</p>
                    <p className="flex items-center flex-wrap"><FaClock className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Time:</span> {order.pickupTime || "Not specified"}</p>
                    <p className="flex items-center flex-wrap"><FaMapMarkerAlt className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Location:</span> {order.location}</p>
                    {order.contactPerson && (
                      <p className="flex items-center flex-wrap"><FaUser className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Contact:</span> {order.contactPerson}</p>
                    )}
                    {order.contactNumber && (
                      <p className="flex items-center flex-wrap"><FaPhone className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Number:</span> {order.contactNumber}</p>
                    )}
                  </div>
                  <motion.div layout className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDetails(index)}
                      className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                    >
                      {showDetails[index] ? <FaEyeSlash /> : <FaEye />} <span className="ml-2">More Details</span>
                    </motion.button>
                    <AnimatePresence>
                      {showDetails[index] && (
                        <motion.div
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-100 p-4 rounded-lg overflow-hidden mt-4"
                        >
                          {!order.contactPerson && (
                            <p className="flex items-center"><FaUser className="text-gray-500 mr-2" /> <span className="font-medium">Contact Person:</span> {order.contactPerson}</p>
                          )}
                          {!order.contactNumber && (
                            <p className="flex items-center"><FaPhone className="text-gray-500 mr-2" /> <span className="font-medium">Contact Number:</span> {order.contactNumber}</p>
                          )}
                          <p className="flex items-center"><FaBoxOpen className="text-gray-500 mr-2" /> <span className="font-semibold">Quantity:</span> {order.quantity} {order.quantityType}</p>
                          {order.storageInstructions && (
                            <div className="mt-2">
                              <p className="font-semibold">Storage Instructions:</p>
                              <p className="text-sm">{order.storageInstructions}</p>
                            </div>
                          )}
                          {order.notes && (
                            <div className="mt-2">
                              <p className="font-semibold">Additional Notes:</p>
                              <p className="text-sm">{order.notes}</p>
                            </div>
                          )}
                          {order.image && (
                            <div className="mt-4">
                              <p className="font-semibold text-gray-700">Food Image:</p>
                              <img
                                src={`data:image/jpeg;base64,${order.image}`}
                                alt="Food"
                                className="w-full h-40 object-cover rounded-lg mt-2 shadow-md"
                                onError={(e) => console.error("Image load error:", e)}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                {/* ProgressBar on the right side */}
                <div className="md:w-1/3 flex items-center justify-center md:justify-end md:-mt-12 md:pr-0"> {/* Added md:-mt-4 and md:pr-0 */}
                  <ProgressBar status={order.status || "Requested"} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PickupStatus;