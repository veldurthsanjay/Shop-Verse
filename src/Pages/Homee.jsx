import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  FaUtensils, FaBoxOpen, FaHandsHelping, FaBell, FaClock, FaTrophy, FaChartLine, 
  FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:8080";

const Homee = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    foodItems: 0, 
    activeDonations: 0,
    totalDonations: 0,
    mealsServed: 0,
    livesSaved: 0,
    foodBanksSupported: 0,
    surplusSaved: 0,
    pendingPickups: 0,
    wasteReduced: 0,
    completedItems: 0,
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [nextPickup, setNextPickup] = useState(null);
  const [topDonorStatus, setTopDonorStatus] = useState(false);
  const [spotlight, setSpotlight] = useState(null);
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);

  const donationGoal = 100;
  const topDonorThreshold = 50;

  const updateStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const foodCartResponse = await fetch(`${API_BASE_URL}/api/food/cart?userId=${userId}`);
      const foodCartData = foodCartResponse.ok ? await foodCartResponse.json() : [];

      const foodItemsResponse = await fetch(`${API_BASE_URL}/api/food/pending?userId=${userId}`);
      const foodItemsData = foodItemsResponse.ok ? await foodItemsResponse.json() : [];

      const pickupOrdersResponse = await fetch(`${API_BASE_URL}/api/pickup/status?userId=${userId}`);
      const pickupOrdersData = pickupOrdersResponse.ok ? await pickupOrdersResponse.json() : [];

      const completedOrdersResponse = await fetch(`${API_BASE_URL}/api/pickup/completed`);
      const completedOrdersData = completedOrdersResponse.ok ? await completedOrdersResponse.json() : [];

      const activeOrdersData = pickupOrdersData.filter(order => order.status !== "Completed");
      const foodItems = foodCartData.length;
      const activeDonations = activeOrdersData.filter(order => order.status === "Requested").length;
      const totalDonations = pickupOrdersData.length + completedOrdersData.length;
      const mealsServed = completedOrdersData.length;
      const livesSaved = mealsServed * 3;
      const foodBanksSupported = [...new Set(completedOrdersData.map(order => order.location))].length;
      const surplusSaved = completedOrdersData.reduce((total, order) => total + (parseInt(order.quantity) || 0), 0);
      const pendingPickups = activeOrdersData.filter(order => order.status === "Pending").length;
      const wasteReduced = surplusSaved * 0.5;
      const completedItems = completedOrdersData.length;

      setStats({
        foodItems,
        activeDonations,
        totalDonations,
        mealsServed,
        livesSaved,
        foodBanksSupported,
        surplusSaved,
        pendingPickups,
        wasteReduced,
        completedItems,
      });

      setRecentDonations(completedOrdersData.slice(-5).reverse());
      setCompletedOrders(completedOrdersData);

      const pending = activeOrdersData.find(order => order.status === "Pending");
      setNextPickup(pending ? { time: pending.pickupTime || "Soon", location: pending.location } : null);
      setTopDonorStatus(mealsServed >= topDonorThreshold);

      const mostFrequentBank = completedOrdersData.reduce((acc, order) => {
        acc[order.location] = (acc[order.location] || 0) + 1;
        return acc;
      }, {});
      const topBank = Object.entries(mostFrequentBank).sort((a, b) => b[1] - a[1])[0];
      setSpotlight(topBank ? { bank: topBank[0], meals: topBank[1] * 3 } : null);
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  useEffect(() => {
    updateStats();
    const handleStorageChange = (event) => {
      if (event.type === 'localStorageUpdate' && event.detail?.type === 'completed') {
        updateStats();
      }
    };
    window.addEventListener("localStorageUpdate", handleStorageChange);

    const timer = setTimeout(() => {
      setNotification("Your next donation could save 3 lives!!");
    }, 3000);
    const interval = setInterval(updateStats, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("localStorageUpdate", handleStorageChange);
    };
  }, []);

  const toggleCompletedOrders = () => {
    setShowCompletedOrders(!showCompletedOrders);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-red-50 to-green-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8 md:mb-12 relative"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-amber-800 mb-4 tracking-tight flex items-center justify-center gap-2">
          Restaurant Dashboard {topDonorStatus && <FaTrophy className="text-yellow-500" />}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          Transform your surplus into sustenance.
        </p>
        {notification && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-3 bg-green-200 text-green-800 rounded-full inline-flex items-center gap-2 shadow-lg"
          >
            <FaBell className="animate-bounce" />
            <span>{notification}</span>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Your Impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{stats.totalDonations}</p>
              <p className="text-gray-600">Total Donations</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{stats.mealsServed}</p>
              <p className="text-gray-600">Meals Provided</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats.livesSaved}</p>
              <p className="text-gray-600">Lives Saved</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-3xl font-bold text-pink-600">{stats.surplusSaved}</p>
              <p className="text-gray-600">Surplus Rescued</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartLine /> Waste Reduced
          </h2>
          <p className="text-4xl font-bold text-teal-600">{stats.wasteReduced.toFixed(1)} kg</p>
          <p className="text-gray-600 mt-2">Food waste prevented this month</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.wasteReduced / 50) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-4 bg-teal-500 rounded-full"
              style={{ maxWidth: "100%" }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Goal: 50 kg</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 relative overflow-hidden"
          onClick={() => navigate("/add")}
        >
          <FaBoxOpen className="text-4xl text-amber-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Food Cart</h2>
          <p className="text-3xl font-bold text-amber-600">{stats.foodItems}</p>
          <p className="text-gray-600">Items in Cart</p>
          <button className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all">
            Add More Now
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 relative overflow-hidden"
          onClick={() => navigate("/food-cart")}
        >
          <FaClock className="text-4xl text-green-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Next Pickup</h2>
          <p className="text-lg font-bold text-green-600">{nextPickup ? nextPickup.time : "None"}</p>
          <p className="text-gray-600">{nextPickup ? nextPickup.location : "Schedule One"}</p>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all">
            {nextPickup ? "Details" : "Schedule"}
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-red-100 relative overflow-hidden"
          onClick={() => navigate("/pickup-status")}
        >
          <FaHandsHelping className="text-4xl text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Active Donations</h2>
          <p className="text-3xl font-bold text-red-600">{stats.activeDonations}</p>
          <p className="text-gray-600">In Progress</p>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all">
            Track
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 relative overflow-hidden"
          onClick={() => navigate("/home")}
        >
          <FaUtensils className="text-4xl text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Completed Donations</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.completedItems}</p>
          <p className="text-gray-600">Food Items</p>
          <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all">
            Completed
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-7xl mx-auto mb-12 bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Recent Donations</h2>
        {recentDonations.length > 0 ? (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentDonations.map((donation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{donation.foodType} ({donation.quantity} {donation.quantityType})</p>
                  <p className="text-sm text-gray-600">{donation.location}</p>
                  <p className="text-xs text-gray-500">Completed on {donation.completedDate ? new Date(donation.completedDate).toLocaleString() : new Date().toLocaleString()}</p>
                </div>
                <p className="text-sm text-green-600">Completed</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent donations yet. Start today!</p>
        )}
        <button
          onClick={toggleCompletedOrders}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all"
        >
          {showCompletedOrders ? "Hide Full History" : "View Full History"}
        </button>

        <AnimatePresence>
          {showCompletedOrders && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <h3 className="text-xl font-bold text-gray-700 mb-4">Completed Donations</h3>
              {completedOrders.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {completedOrders.map((order, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center mb-2">
                        <FaUtensils className="text-2xl text-green-600 mr-2" />
                        <h4 className="text-lg font-semibold text-gray-800">{order.restaurantName}</h4>
                      </div>
                      <p className="flex items-center text-gray-700"><FaBoxOpen className="mr-2" /> <span className="font-medium">Food:</span> {order.foodType}</p>
                      <p className="flex items-center text-gray-700"><FaCalendarAlt className="mr-2" /> <span className="font-medium">Expiry:</span> {order.expiryDate}</p>
                      <p className="flex items-center text-gray-700"><FaClock className="mr-2" /> <span className="font-medium">Time:</span> {order.pickupTime}</p>
                      <p className="flex items-center text-gray-700"><FaMapMarkerAlt className="mr-2" /> <span className="font-medium">Location:</span> {order.location}</p>
                      <p className="flex items-center text-gray-700"><FaUser className="mr-2" /> <span className="font-medium">Contact:</span> {order.contactPerson}</p>
                      <p className="flex items-center text-gray-700"><FaPhone className="mr-2" /> <span className="font-medium">Number:</span> {order.contactNumber}</p>
                      <p className="flex items-center text-gray-700"><FaBoxOpen className="mr-2" /> <span className="font-medium">Qty:</span> {order.quantity} {order.quantityType}</p>
                      {order.storageInstructions && <p className="text-gray-700"><span className="font-medium">Storage:</span> {order.storageInstructions}</p>}
                      {order.notes && <p className="text-gray-700"><span className="font-medium">Notes:</span> {order.notes}</p>}
                      {order.image && <img src={`data:image/jpeg;base64,${order.image}`} alt="Food" className="w-full h-40 object-cover rounded-lg mt-2" />}
                      <p className="text-sm text-green-600 mt-2">Completed on {order.completedDate ? new Date(order.completedDate).toLocaleString() : new Date().toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No completed donations yet.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Monthly Goal</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.mealsServed / donationGoal) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-4 bg-green-500 rounded-full"
              style={{ maxWidth: "100%" }}
            />
          </div>
          <p className="text-gray-700">
            {stats.mealsServed} / {donationGoal} meals saved
            <span className="block text-sm text-gray-500 mt">
            {donationGoal - stats.mealsServed} more to go!
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> Next Milestone
          </h3>
          {stats.mealsServed < donationGoal ? (
            <>
              <p className="text-lg font-semibold text-gray-700">
                {stats.mealsServed < 5 ? "Share 5 Meals" :
                 stats.mealsServed < 10 ? "Share 10 Meals" :
                 stats.mealsServed < 15 ? "Share 15 Meals" :
                 `Reach ${donationGoal} Meals`}
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {stats.mealsServed < 5 ? 5 - stats.mealsServed :
                 stats.mealsServed < 10 ? 10 - stats.mealsServed :
                 stats.mealsServed < 15 ? 15 - stats.mealsServed :
                 donationGoal - stats.mealsServed} to go!
              </p>
              <p className="text-gray-600 text-sm mt-1">Keep sharing to hit this goal!</p>
            </>
          ) : (
            <p className="text-gray-600">Monthly goal crushed! Set a new one?</p>
          )}
          <button
            onClick={() => navigate("/add")}
            className="mt-3 px-4 py-1 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-all"
          >
            Share More
          </button>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="max-w-7xl mx-auto mb-12 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-2xl shadow-lg p-6 text-center"
      >
        <h3 className="text-2xl md:text-3xl font-bold">
          {topDonorStatus ? "Keep Up the Amazing Work!" : "Be a Hunger Hero"}
        </h3>
        <p className="mt-2 text-lg">
          {topDonorStatus
            ? "Your contributions are transforming lives!"
            : "Your restaurant changes lives with virtue."}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/add")}
            className="px-6 py-2 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
          > Donate Now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Homee;