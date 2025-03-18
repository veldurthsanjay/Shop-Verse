import React, { useState, useEffect } from "react";
import { FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaBoxOpen, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:8080";

const STATUS_WORKFLOW = {
  "Requested": { next: "Accepted", button: "Accept" },
  "Accepted": { next: "Person on the Way", button: "Coming" },
  "Person on the Way": { next: "Completed", button: "Completed" },
  "Completed": { next: null, button: null }
};

const BUTTON_CONFIG = {
  "Accept": { label: "Accept", gradient: "from-blue-500 to-blue-700", hover: "from-blue-600 to-blue-800" },
  "Coming": { label: "Coming", gradient: "from-yellow-500 to-yellow-700", hover: "from-yellow-600 to-yellow-800" },
  "Completed": { label: "Completed", gradient: "from-green-500 to-green-700", hover: "from-green-600 to-green-800" }
};

const Pickups = () => {
  const [pickupOrders, setPickupOrders] = useState([]);
  const [showDetails, setShowDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(null);
  const [modalType, setModalType] = useState(null);

  const fetchPickupOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup/available`);
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
    const interval = setInterval(fetchPickupOrders, 100000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (index, newStatus) => {
    const order = pickupOrders[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup/${order.id}?status=${newStatus}`, {
        method: "PUT",
      });
      if (response.ok) {
        if (newStatus === "Completed") {
          setPickupOrders(prevOrders => prevOrders.filter((_, i) => i !== index));
          window.dispatchEvent(new CustomEvent('localStorageUpdate', { detail: { type: 'completed' } }));
        } else {
          await fetchPickupOrders();
        }
      } else {
        alert("Failed to update status: " + await response.text());
      }
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
    setShowModal(false);
    setCurrentOrderIndex(null);
    setModalType(null);
  };

  const confirmAction = (index, type) => {
    setModalType(type);
    setCurrentOrderIndex(index);
    setShowModal(true);
  };

  const handleConfirmYes = () => {
    const order = pickupOrders[currentOrderIndex];
    const currentStatus = order.status || "Requested";
    const nextStatus = STATUS_WORKFLOW[currentStatus]?.next;
    if (nextStatus) updateStatus(currentOrderIndex, nextStatus);
  };

  const handleConfirmNo = () => {
    setShowModal(false);
    setCurrentOrderIndex(null);
    setModalType(null);
  };

  const getStatusColor = (status) => ({
    "Accepted": "from-blue-400 to-blue-600",
    "Person on the Way": "from-yellow-400 to-yellow-600",
    "Completed": "from-green-400 to-green-600",
    default: "bg-gray-300"
  }[status] || "bg-gray-300");

  const getStatusProgress = (status) => ({
    "Requested": "10%",
    "Accepted": "33.33%",
    "Person on the Way": "66.66%",
    "Completed": "100%",
    default: "0%"
  }[status] || "0%");

  const toggleDetails = (index) => {
    setShowDetails(prev => {
      const newState = { ...prev, [index]: !prev[index] };
      console.log(`Toggling details for index ${index}, new state:`, newState);
      return newState;
    });
  };

  const isButtonEnabled = (orderStatus, buttonType) => {
    const currentStatus = orderStatus || "Requested";
    return STATUS_WORKFLOW[currentStatus]?.button === buttonType;
  };

  const getTooltipMessage = (orderStatus, buttonType) => {
    const currentStatus = orderStatus || "Requested";
    const workflow = STATUS_WORKFLOW[currentStatus];
    if (workflow.button === buttonType) return "";
    if (!workflow.next) return "Order is already completed.";
    if (buttonType === "Accept") return "Order must be accepted first.";
    if (buttonType === "Coming") return "Accept the order before marking as coming.";
    if (buttonType === "Completed") return "Mark as 'Coming' before completing.";
    return "Action not available.";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen overflow-auto last:mb-14">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800 drop-shadow-lg"
      >
        Pickups
      </motion.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pickupOrders.length > 0 ? pickupOrders.map((order, index) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border border-blue-500 transition-all duration-300 flex flex-col h-fit relative"
          >
            <div className="md:flex-row justify-between gap-4">
              <div className="flex-1 md:pr-8">
                <div className="flex items-center mb-4">
                  <FaUtensils className="text-2xl text-blue-500 mr-3 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gray-800">{order.restaurantName}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p className="flex items-center flex-wrap text-lg">
                    <FaBoxOpen className="text-gray-500 mr-3 text-xl" />
                    <span className="font-semibold mr-2">Food:</span>
                    <span>{order.foodType}</span>
                  </p>
                  <p className="flex items-center flex-wrap text-lg">
                    <FaCalendarAlt className="text-gray-500 mr-3 text-xl" />
                    <span className="font-semibold mr-2">Expiry:</span>
                    <span>{order.expiryDate || "Not specified"}</span>
                  </p>
                  <p className="flex items-center flex-wrap text-lg">
                    <FaClock className="text-gray-500 mr-3 text-xl" />
                    <span className="font-semibold mr-2">Time:</span>
                    <span>{order.pickupTime || "Not specified"}</span>
                  </p>
                  <p className="flex items-center flex-wrap text-lg">
                    <FaMapMarkerAlt className="text-gray-500 mr-3 text-xl" />
                    <span className="font-semibold mr-2">Location:</span>
                    <span>{order.location}</span>
                  </p>
                </div>
                <motion.div layout className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDetails(index)}
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                  >
                    {showDetails[index] ? <FaEyeSlash /> : <FaEye />} <span className="ml-2">Details</span>
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
                        className="bg-gray-100 p-4 rounded-lg overflow-hidden mt-4 space-y-4 text-gray-700"
                      >
                        <p className="flex items-center text-lg">
                          <FaUser className="text-gray-500 mr-3 text-xl" />
                          <span className="font-semibold mr-2">Contact:</span>
                          <span>{order.contactPerson}</span>
                        </p>
                        <p className="flex items-center text-lg">
                          <FaPhone className="text-gray-500 mr-3 text-xl" />
                          <span className="font-semibold mr-2">Number:</span>
                          <span>{order.contactNumber}</span>
                        </p>
                        <p className="flex items-center text-lg">
                          <FaBoxOpen className="text-gray-500 mr-3 text-xl" />
                          <span className="font-semibold mr-2">Qty:</span>
                          <span>{order.quantity} {order.quantityType}</span>
                        </p>
                        {order.storageInstructions && (
                          <div className="mt-2">
                            <p className="font-semibold text-lg">Storage Instructions:</p>
                            <p className="text-lg mt-1">{order.storageInstructions}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="mt-2">
                            <p className="font-semibold text-lg">Additional Notes:</p>
                            <p className="text-lg mt-1">{order.notes}</p>
                          </div>
                        )}
                        {order.image && (
                          <div className="mt-4">
                            <p className="font-semibold text-lg text-gray-700">Food Image:</p>
                            <img
                              src={`data:image/jpeg;base64,${order.image}`}
                              alt="Food"
                              className="w-full h-40 object-cover rounded-lg mt-2 shadow-md"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              <div className="md:w-1/3 flex items-center justify-center md:justify-end">
                {/* Placeholder for a vertical ProgressBar */}
              </div>
            </div>
            <div className="mt-6 w-full">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: getStatusProgress(order.status) }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${getStatusColor(order.status)}`}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">Status: <span className="font-semibold">{order.status || "Requested"}</span></p>
              <p className="text-sm text-gray-700 mb-3 italic text-center">
                Follow this order: <span className="font-bold">Accept Food</span> → <span className="font-bold">Coming for food</span> → <span className="font-bold">Completed</span>
              </p>
              <div className="flex justify-between gap-2">
                {Object.entries(BUTTON_CONFIG).map(([buttonType, { label, gradient, hover }]) => {
                  const enabled = isButtonEnabled(order.status, buttonType);
                  const tooltip = getTooltipMessage(order.status, buttonType);
                  return (
                    <motion.button
                      key={buttonType}
                      whileHover={{ scale: enabled ? 1.05 : 1 }}
                      whileTap={{ scale: enabled ? 0.95 : 1 }}
                      animate={enabled ? { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                      onClick={() => enabled && confirmAction(index, buttonType.toLowerCase())}
                      disabled={!enabled}
                      className={`flex-1 px-2 py-2 rounded-lg shadow-md text-sm font-bold transition-all duration-300 relative group ${enabled ? `bg-gradient-to-r ${gradient} text-white hover:${hover}` : "bg-gray-300 cursor-not-allowed"}`}
                    >
                      {label}
                      {!enabled && tooltip && (
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block text-xs text-white bg-gray-800 p-1 rounded shadow">
                          {tooltip}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )) : <p className="text-center text-gray-600 col-span-full text-lg">No pickup orders yet.</p>}
      </div>
      <AnimatePresence>
        {showModal && (
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
              className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {modalType === "accept" ? "Confirm Acceptance" : modalType === "coming" ? "Confirm Pickup" : "Confirm Completion"}
              </h2>
              <p className="text-gray-600 mb-6">
                {modalType === "accept" ? "Are you sure you want to accept this food item?" : 
                 modalType === "coming" ? "Are you sure you want to pick up this food item?" : 
                 "Have you received the food?"}
              </p>
              <div className="flex justify-around">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleConfirmYes}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Yes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleConfirmNo}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

export default Pickups;