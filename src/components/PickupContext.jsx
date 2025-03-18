import React, { createContext, useState } from "react";

export const PickupContext = createContext();

export const PickupProvider = ({ children }) => {
  const [pickupOrders, setPickupOrders] = useState([
    {
      restaurantName: "Pizza Place",
      status: "Pending",
      expiryDate: "2025-03-10",
      pickupTime: "2:00 PM",
      location: "Downtown Street",
      contactPerson: "John Doe",
      contactNumber: "123-456-7890",
      image: "https://via.placeholder.com/150",
    },
  ]);

  return (
    <PickupContext.Provider value={{ pickupOrders, setPickupOrders }}>
      {children}
    </PickupContext.Provider>
  );
};
