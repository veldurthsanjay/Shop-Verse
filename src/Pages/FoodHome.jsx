import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUtensils, FaBoxOpen, FaHandsHelping, FaBell, FaMapMarkerAlt, FaSearch, FaUsers, FaList, FaInfoCircle,
  FaCalendarAlt, FaClock 
} from "react-icons/fa";
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:8080";

const FoodHome = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    foodItems: 0,
    donationsMade: 0,
    mealsServed: 0,
    livesSaved: 0,
    foodBanksSupported: 0,
    surplusSaved: 0,
    nearbyShares: 0,
    availablePickups: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // Filter: all, restaurant, food-bank, individual
  const [pickups, setPickups] = useState([]);
  const [foodBankRequests, setFoodBankRequests] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [donatedHistory, setDonatedHistory] = useState([]);

  const updateStats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No user ID found");
        return;
      }
      const foodItemsResponse = await fetch(`${API_BASE_URL}/api/food/pending?userId=${userId}`);
      const foodItemsData = foodItemsResponse.ok ? await foodItemsResponse.json() : [];
      const pickupOrdersResponse = await fetch(`${API_BASE_URL}/api/pickup/status?userId=${userId}`);
      const pickupOrdersData = pickupOrdersResponse.ok ? await pickupOrdersResponse.json() : [];
      const completedOrdersResponse = await fetch(`${API_BASE_URL}/api/pickup/completed`);
      const completedOrdersData = completedOrdersResponse.ok ? await completedOrdersResponse.json() : [];
      const donatedHistoryData = JSON.parse(localStorage.getItem("donatedHistory")) || []; 
      const foodItems = foodItemsData.length + donatedHistoryData.length;
      const donationsMade = pickupOrdersData.filter(order => order.status === "Requested").length;
      const completedPickups = completedOrdersData;
      const mealsServed = completedPickups.length + donatedHistoryData.length;
      const livesSaved = mealsServed * 3;
      const foodBanksSupported = [...new Set([...completedPickups, ...donatedHistoryData].map(order => order.location))].length;
      const surplusSaved = completedPickups.reduce((total, order) => total + (parseInt(order.quantity) || 0), 0) + 
                           donatedHistoryData.reduce((total, order) => total + (parseInt(order.quantity) || 0), 0);
      const nearbyShares = completedOrdersData.filter(order => order.status === "Available").length; // Adjusted to use completed pickups
      const availablePickups = pickupOrdersData.filter(order => order.status === "Available").length;

      setStats({
        foodItems,
        donationsMade,
        mealsServed,
        livesSaved,
        foodBanksSupported,
        surplusSaved,
        nearbyShares,
        availablePickups,
      });

      setPickups(pickupOrdersData.filter(order => order.status === "Available"));
      setFoodBankRequests([]); 
      setVolunteerTasks([]); 
      setDonatedHistory(donatedHistoryData);
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  useEffect(() => {
    updateStats();

    const handleStorageChange = (event) => {
      if (event.type === 'storage' || (event.type === 'localStorageUpdate' && (event.detail?.type === 'completed' || event.detail?.type === 'donated'))) {
        updateStats();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdate", handleStorageChange);

    const timer = setTimeout(() => {
      setNotification("New food shares available nearby!");
    }, 3000);

    const interval = setInterval(updateStats, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageUpdate", handleStorageChange);
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/nearby-food?query=${searchQuery}&filter=${filter}`);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-teal-100">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-teal-800 mb-4 tracking-tight">
          Food Bank Dashboard
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          Find food, connect with food banks, and join the fight against hunger!
        </p>
        {notification && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-3 bg-teal-200 text-teal-800 rounded-full inline-flex items-center gap-2 shadow-lg"
          >
            <FaBell className="animate-bounce" />
            <span>{notification}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Impact Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-5xl mx-auto text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Your FoodShare Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-5xl font-bold text-blue-600">{stats.foodItems}</p>
            <p className="text-gray-600 mt-2">Items Shared</p>
          </div>
          <div className="p-6 bg-teal-50 rounded-lg">
            <p className="text-5xl font-bold text-teal-600">{stats.mealsServed}</p>
            <p className="text-gray-600 mt-2">Meals Served</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg">
            <p className="text-5xl font-bold text-purple-600">{stats.livesSaved}</p>
            <p className="text-gray-600 mt-2">Lives Impacted</p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <p className="text-5xl font-bold text-green-600">{donatedHistory.length}</p>
            <p className="text-gray-600 mt-2">Donated</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 1 }}
          className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border border-blue-100"
          onClick={() => navigate("/find-food")}
        >
          <FaBoxOpen className="text-5xl text-blue-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Share Surplus</h2>
          <p className="text-gray-600 mt-2">Share available food with people</p>
          <button className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all">
            Share ({localStorage.getItem('findFoodCardCount') || 0})
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border border-teal-100"
          onClick={() => navigate("/pickups")}
        >
          <FaHandsHelping className="text-5xl text-teal-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Pickups Ready</h2>
          <p className="text-gray-600 mt-2">Collect food from restaurants now.</p>
          <button className="mt-4 px-5 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-all">
            View ({localStorage.getItem('pickupCardCount') || 0})
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: -1 }}
          className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border border-purple-100"
          onClick={() => navigate("/food-bank-requests")}
        >
          <FaUtensils className="text-5xl text-purple-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Food Bank Requests</h2>
          <p className="text-gray-600 mt-2">Fulfill food bank needs.</p>
          <button className="mt-4 px-5 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all">
            See ({foodBankRequests.length})
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: 1 }}
          className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border border-green-100"
          onClick={() => navigate("/volunteer")}
        >
          <FaUsers className="text-5xl text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Volunteer</h2>
          <p className="text-gray-600 mt-2">Help with pickups and deliveries.</p>
          <button className="mt-4 px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all">
            Join ({volunteerTasks.length})
          </button>
        </motion.div>
      </div>

      {/* History of Donated Collection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-5xl mx-auto mb-12 bg-white rounded-2xl shadow-md p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">History of Donated Collection</h2>
        {donatedHistory.length > 0 ? (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {donatedHistory.map((donation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center mb-2">
                  <FaUtensils className="text-2xl text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-gray-800">{donation.restaurantName}</h4>
                </div>
                <p className="flex items-center text-gray-700"><FaBoxOpen className="mr-2" /> <span className="font-medium">Food:</span> {donation.foodType}</p>
                <p className="flex items-center text-gray-700"><FaCalendarAlt className="mr-2" /> <span className="font-medium">Expiry:</span> {donation.expiryDate}</p>
                <p className="flex items-center text-gray-700"><FaClock className="mr-2" /> <span className="font-medium">Pickup:</span> {donation.pickupTime}</p>
                <p className="flex items-center text-gray-700"><FaMapMarkerAlt className="mr-2" /> <span className="font-medium">Location:</span> {donation.location}</p>
                <p className="text-sm text-green-600 mt-2">Donated on {new Date(donation.donatedDate).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No donated collections yet. Start donating today!</p>
        )}
      </motion.div>
      <motion.div
        whileHover={{ y: -5 }}
        className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl text-center shadow-lg last:mb-16"
      >
        <h3 className="text-2xl font-bold">Join the FoodShare Movement</h3>
        <p className="mt-2">Together, we can end hunger one share at a time</p>
        <button
          onClick={() => navigate("/near-by-food")}
          className="mt-4 px-6 py-2 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
        >
          Start Sharing
        </button>
      </motion.div>
    </div>
  );
};

export default FoodHome;