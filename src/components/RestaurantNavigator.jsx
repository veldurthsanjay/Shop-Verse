import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBowlFood, faPlus, faTruckFast, faUser } from '@fortawesome/free-solid-svg-icons';

const RestaurantNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/home', icon: faHome, label: 'Home' },
    { path: '/food-cart', icon: faBowlFood, label: 'Food Cart' },
    { path: '/add', icon: faPlus, label: 'Add Food', isCenter: true },
    { path: '/pickup-status', icon: faTruckFast, label: 'Pickups' },
    { path: '/profile', icon: faUser, label: 'Profile' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-100 via-white to-gray-100 border-t border-gray-300 shadow-lg flex justify-around items-center z-50 h-16">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => handleNavigate(tab.path)}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-300 ${
            location.pathname === tab.path ? 'text-green-600' : 'text-gray-600 hover:text-green-500'
          }`}
        >
          {tab.isCenter ? (
            <div className="relative flex flex-col items-center">
              <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full p-3 -mt-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon icon={tab.icon} size="2x" />
              </div>
              <p
                className={`mt-1 text-sm font-bold tracking-wide ${
                  location.pathname === tab.path ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon={tab.icon}
                size="lg"
                className={`transition-transform duration-300 ${location.pathname === tab.path ? 'scale-110' : 'hover:scale-125'}`}
              />
              <p
                className={`mt-1 text-sm font-bold tracking-wide ${
                  location.pathname === tab.path ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                {tab.label}
              </p>
              <span
                className={`w-8 h-1.5 mt-1 rounded-full bg-gradient-to-r from-green-500 to-green-700 shadow-md transition-all duration-300 ${
                  location.pathname === tab.path ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
                }`}
              />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default RestaurantNavigator;