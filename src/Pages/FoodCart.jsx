import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaBoxOpen, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBowlFood } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:8080";

const FoodCart = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pickupSuccess, setPickupSuccess] = useState(false);
  const navigate = useNavigate();

  const fetchFoodItems = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No user ID found");
      navigate("/auth");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/cart?userId=${userId}`);
      if (response.ok) {
        const items = await response.json();
        setFoodItems(items);
      } else {
        console.error("Failed to fetch food items:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [navigate]);

  const removeItem = async (index) => {
    const itemToDelete = foodItems[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/delete/${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFoodItems(foodItems.filter((_, i) => i !== index));
        setConfirmDelete(null);
      } else {
        alert("Failed to delete food item: " + await response.text());
      }
    } catch (error) {
      alert("Error deleting food item: " + error.message);
    }
  };

  const toggleDetails = (index) => setShowDetails((prev) => ({ ...prev, [index]: !prev[index] }));

  const setPickup = async (index) => {
    const itemToPickup = foodItems[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/food/pickup/${itemToPickup.id}?status=Requested`, {
        method: "PUT",
      });
      if (response.ok) {
        await fetchFoodItems();
        setPickupSuccess(true);
      } else {
        alert("Failed to set pickup: " + await response.text());
      }
    } catch (error) {
      alert("Error setting pickup: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-auto last:mb-14">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 drop-shadow-lg"
      >
        Food Cart
      </motion.h1>

      {foodItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-[80vh] text-center"
        >
          <div className="relative mb-8">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <FontAwesomeIcon icon={faBowlFood} className="size-16 text-gray-700" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4 animate-pulse">Your Food Cart is Empty! 😞</h2>
          <p className="text-lg text-gray-600 max-w-md">Be the reason someone eats today save food, spread kindness!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/add")}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 flex items-center gap-2"
          >
            <span className="animate-bounce">➕</span> Add Food Now
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((food, index) => (
            <motion.div
              key={food.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-red-200 transition-all duration-300 flex flex-col h-fit"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaUtensils className="text-2xl text-red-500 mr-3 animate-pulse" />
                  <h2 className="text-xl font-bold text-gray-800">{food.restaurantName}</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setConfirmDelete(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-full shadow-md hover:bg-red-600 transition-all duration-300"
                >
                  <FaTrash />
                </motion.button>
              </div>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center flex-wrap"><FaBoxOpen className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Food:</span> {food.foodType}</p>
                <p className="flex items-center flex-wrap"><FaBoxOpen className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Qty:</span> {food.quantity} {food.quantityType}</p>
                <p className="flex items-center flex-wrap"><FaCalendarAlt className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Expiry:</span> {food.expiryDate || "Not specified"}</p>
                <p className="flex items-center flex-wrap"><FaClock className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Time:</span> {food.pickupTime || "Not specified"}</p>
                <p className="flex items-center flex-wrap"><FaMapMarkerAlt className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Location:</span> {food.location}</p>
                <p className="flex items-center flex-wrap"><FaUser className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Contact:</span> {food.contactPerson}</p>
                <p className="flex items-center flex-wrap"><FaPhone className="text-gray-500 mr-2 text-lg md:text-xl" /><span className="font-semibold">Number:</span> {food.contactNumber}</p>
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
                      className="bg-gray-100 p-4 rounded-lg overflow-hidden"
                    >
                      <p className="font-semibold">Storage Instructions:</p>
                      <p className="text-sm">{food.storageInstructions}</p>
                      <p className="font-semibold mt-2">Additional Notes:</p>
                      <p className="text-sm">{food.notes}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              {food.image && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-700">Food Image:</p>
                  <img
                    src={`data:image/jpeg;base64,${food.image}`}
                    alt="Food"
                    className="w-full h-40 object-cover rounded-lg mt-2 shadow-md"
                    onError={(e) => console.error("Image load error:", e)}
                  />
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPickup(index)}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="animate-ping">✅</span> Set Pickup
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {pickupSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm w-full"
            >
              <p className="text-lg font-semibold text-gray-800">✅ Pickup Requested Successfully</p>
              <p className="text-gray-600 mt-2">Check the status in Pickup Status.</p>
              <div className="flex justify-center mt-4 space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setPickupSuccess(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all">
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/pickup-status")}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg hover:from-green-700 hover:to-green-900 transition-all">
                  Go to Pickup Status
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full"
            >
              <p className="text-lg font-semibold text-gray-800">Are you sure you want to remove this item?</p>
              <div className="flex justify-end mt-4 space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => removeItem(confirmDelete)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition-all"
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodCart;