import React, { useState, useEffect } from "react";
import { FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaBoxOpen } from "react-icons/fa";
import { motion } from "framer-motion";

const CompletedPickups = () => {
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("pickupOrders")) || [];
    const completed = storedOrders.filter((order) => order.status === "Completed");
    setCompletedOrders(completed);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen overflow-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-8 text-gray-800 drop-shadow-lg"
      >
        Completed Pickups
      </motion.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 last:mb-20">
        {completedOrders.length > 0 ? (
          completedOrders.map((order, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-200 transition-shadow duration-300"
            >
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <FaUtensils className="text-3xl text-green-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">{order.restaurantName}</h2>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <FaBoxOpen className="mr-2" /> <span className="font-medium">Food:</span> {order.foodType}
                  </p>
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2" /> <span className="font-medium">Expiry:</span> {order.expiryDate}
                  </p>
                  <p className="flex items-center">
                    <FaClock className="mr-2" /> <span className="font-medium">Time:</span> {order.pickupTime}
                  </p>
                  <p className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" /> <span className="font-medium">Location:</span> {order.location}
                  </p>
                  <p className="flex items-center">
                    <FaUser className="mr-2" /> <span className="font-medium">Contact:</span> {order.contactPerson}
                  </p>
                  <p className="flex items-center">
                    <FaPhone className="mr-2" /> <span className="font-medium">Number:</span> {order.contactNumber}
                  </p>
                  <p className="flex items-center">
                    <FaBoxOpen className="mr-2" /> <span className="font-medium">Qty:</span> {order.quantity} {order.quantityType}
                  </p>
                  {order.storageInstructions && (
                    <p>
                      <span className="font-medium">Storage:</span> {order.storageInstructions}
                    </p>
                  )}
                  {order.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  )}
                  {order.image && (
                    <img src={order.image} alt="Food" className="w-full h-40 object-cover rounded-lg mt-3 shadow-md" />
                  )}
                  {order.completedDate && (
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Completed on:</span> {new Date(order.completedDate).toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-sm text-green-600 mt-4 text-center font-semibold">
                  Status: Completed
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full text-lg">No completed pickups yet.</p>
        )}
      </div>
    </div>
  );
};

export default CompletedPickups;