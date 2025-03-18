import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faHandsHelping } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://localhost:8080";

const RoleSelection = ({ setUserType }) => {
  const navigate = useNavigate();

  const handleRoleSelect = async (role) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/role/select?userId=${userId}&role=${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setUserType(role);
        localStorage.setItem("userType", role);
        navigate("/home", { replace: true });
      } else {
        const errorText = await response.text();
        console.error("Failed to set role:", errorText);
      }
    } catch (error) {
      console.error("Error selecting role:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome to FoodShare</h1>
        <p className="text-lg text-center text-gray-600 mb-6">Choose your role to continue</p>
        <div className="space-y-4">
          <button
            className="w-full p-4 bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            onClick={() => handleRoleSelect("donor")}
          >
            <div className="flex flex-col items-center">
              <FontAwesomeIcon icon={faStore} size="2x" className="mb-2" />
              <p className="text-2xl font-bold">I'm a Restaurant</p>
              <p className="text-base mt-1">I want to donate surplus food</p>
            </div>
          </button>
          <button
            className="w-full p-4 bg-green-500 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            onClick={() => handleRoleSelect("receiver")}
          >
            <div className="flex flex-col items-center">
              <FontAwesomeIcon icon={faHandsHelping} size="2x" className="mb-2" />
              <p className="text-2xl font-bold">I'm a Food Bank</p>
              <p className="text-base mt-1">I want to receive donations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;