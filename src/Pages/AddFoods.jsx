import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaImage, FaHeart, FaBoxOpen, FaTrash, FaCamera, FaLeaf } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBowlFood } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:8080";

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const AddFood = () => {
  const [step, setStep] = useState(1);
  const [foodData, setFoodData] = useState({
    restaurantName: "",
    foodType: "Prepared Meals",
    quantity: "",
    quantityType: "kg",
    expiryDate: "",
    pickupTime: "",
    storageInstructions: "Refrigerated",
    notes: "",
    location: "",
    contactPerson: "",
    contactNumber: "",
    image: null,
    status: "pending",
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(getInitialTime());
  const navigate = useNavigate();

  const quantityTypes = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "boxes", label: "Boxes" },
    { value: "servings", label: "Servings" },
    { value: "liters", label: "Liters (L)" },
    { value: "pieces", label: "Pieces" },
  ];

  const storageInstructionTypes = [
    { value: "Refrigerated", label: "Refrigerated (4°C)" },
    { value: "Frozen", label: "Frozen (-18°C)" },
    { value: "Room Temperature", label: "Room Temperature" },
    { value: "Dry Storage", label: "Dry Storage" },
    { value: "Consume Immediately", label: "Consume Immediately" },
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

   function getInitialTime() {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getInitialTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const validateStep = (currentStep) => {
    const newErrors = {};
    const currentDate = getCurrentDate();

    switch (currentStep) {
      case 1:
        if (!foodData.restaurantName) newErrors.restaurantName = "Restaurant name is required";
        if (!foodData.foodType) newErrors.foodType = "Food type is required";
        if (!foodData.quantity || isNaN(foodData.quantity) || foodData.quantity <= 0) newErrors.quantity = "Quantity must be a positive number";
        break;
      case 2:
        if (!foodData.expiryDate) {
          newErrors.expiryDate = "Expiry date is required";
        } else if (foodData.expiryDate < currentDate) {
          newErrors.expiryDate = "Expiry date cannot be in the past";
        }
        if (!foodData.pickupTime) {
          newErrors.pickupTime = "Pickup time is required";
        } else if (foodData.expiryDate === currentDate && foodData.pickupTime < currentTime) {
          newErrors.pickupTime = `Pickup time must be ${currentTime} or later for today`;
        }
        break;
      case 3:
        if (!foodData.location) newErrors.location = "Location is required";
        if (foodData.contactNumber && !/^\d{10}$/.test(foodData.contactNumber)) {
          newErrors.contactNumber = "Contact number must be exactly 10 digits";
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFoodData({ ...foodData, [name]: numericValue });
      if (!numericValue || /^\d{10}$/.test(numericValue)) {
        setErrors({ ...errors, [name]: "" });
      } else {
        setErrors({ ...errors, [name]: "Contact number must be exactly 10 digits" });
      }
    } else {
      setFoodData({ ...foodData, [name]: value });
      if (errors[name]) setErrors({ ...errors, [name]: "" });
    }
  };

  const handleImageUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFoodData({ ...foodData, image: file });
  };

  const handleCameraUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFoodData({ ...foodData, image: file });
  };

  const handleDeleteImage = () => {
    setFoodData({ ...foodData, image: null });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleImageUpload,
    accept: "image/*",
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setPopupMessage("User not logged in. Please log in again.");
      setShowPopup(true);
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("restaurantName", foodData.restaurantName);
    formData.append("foodType", foodData.foodType);
    formData.append("quantity", foodData.quantity);
    formData.append("quantityType", foodData.quantityType);
    formData.append("expiryDate", foodData.expiryDate);
    formData.append("pickupTime", foodData.pickupTime);
    formData.append("storageInstructions", foodData.storageInstructions);
    formData.append("notes", foodData.notes);
    formData.append("location", foodData.location);
    formData.append("contactPerson", foodData.contactPerson);
    formData.append("contactNumber", foodData.contactNumber);
    formData.append("status", foodData.status);
    if (foodData.image) {
      formData.append("image", foodData.image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/food/add`, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      if (response.ok) {
        setPopupMessage("Food Added Successfully!");
        setShowPopup(true);
      } else {
        setPopupMessage(result || "Failed to add food");
        setShowPopup(true);
      }
    } catch (error) {
      setPopupMessage("Error: Unable to connect to server");
      setShowPopup(true);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4 min-h-[400px]">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Restaurant Name / Shop Name</label>
        <input
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.restaurantName ? "border-red-500" : "border-gray-300"}`}
          name="restaurantName"
          type="text"
          value={foodData.restaurantName}
          onChange={handleChange}
          placeholder="Enter restaurant name"
        />
        {errors.restaurantName && <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Food Type</label>
        <select
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.foodType ? "border-red-500" : "border-gray-300"}`}
          name="foodType"
          value={foodData.foodType}
          onChange={handleChange}
        >
          <option value="Prepared Meals">Prepared Meals</option>
          <option value="Fresh Produce">Fresh Produce</option>
          <option value="Baked Goods">Baked Goods</option>
          <option value="Dairy Products">Dairy Products</option>
          <option value="Canned Foods">Canned Foods</option>
          <option value="Beverages">Beverages</option>
          <option value="Snacks">Snacks</option>
          <option value="Other">Other</option>
        </select>
        {errors.foodType && <p className="text-red-500 text-sm mt-1">{errors.foodType}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
        <div className="flex gap-3">
          <input
            className={`shadow-md border rounded w-2/3 py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.quantity ? "border-red-500" : "border-gray-300"}`}
            name="quantity"
            type="text"
            value={foodData.quantity}
            onChange={handleChange}
            placeholder="e.g., 5"
          />
          <select
            className="shadow-md border rounded w-1/3 py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border-gray-300"
            name="quantityType"
            value={foodData.quantityType}
            onChange={handleChange}
          >
            {quantityTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
      </div>

      {/* Buttons directly after Quantity */}
      <div className="flex justify-between mt-4">
        {step > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handlePrevious}
            className="flex items-center px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            <FaClock className="mr-2" />
            Previous
          </motion.button>
        )}
        {step < 3 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleNext}
            className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ml-auto"
          >
            Next
            <FaClock className="ml-2" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex items-center px-6 py-2 text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 ml-auto"
          >
            Add Food
            <FontAwesomeIcon icon={faBowlFood} className="ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 min-h-[400px]">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Expiry Date</label>
        <input
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.expiryDate ? "border-red-500" : "border-gray-300"}`}
          name="expiryDate"
          type="date"
          value={foodData.expiryDate}
          onChange={handleChange}
          min={getCurrentDate()}
        />
        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Pickup Time</label>
        <input
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.pickupTime ? "border-red-500" : "border-gray-300"}`}
          name="pickupTime"
          type="time"
          value={foodData.pickupTime}
          onChange={handleChange}
          min={foodData.expiryDate === getCurrentDate() ? currentTime : "00:00"}
        />
        {errors.pickupTime && <p className="text-red-500 text-sm mt-1">{errors.pickupTime}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Storage Instructions</label>
        <select
          className="shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border-gray-300"
          name="storageInstructions"
          value={foodData.storageInstructions}
          onChange={handleChange}
        >
          {storageInstructionTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Buttons directly after Storage Instructions */}
      <div className="flex justify-between mt-4">
        {step > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handlePrevious}
            className="flex items-center px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            <FaClock className="mr-2" />
            Previous
          </motion.button>
        )}
        {step < 3 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleNext}
            className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ml-auto"
          >
            Next
            <FaClock className="ml-2" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex items-center px-6 py-2 text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 ml-auto"
          >
            Add Food
            <FontAwesomeIcon icon={faBowlFood} className="ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 min-h-[400px]">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Location</label>
        <input
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.location ? "border-red-500" : "border-gray-300"}`}
          name="location"
          type="text"
          value={foodData.location}
          onChange={handleChange}
          placeholder="Enter pickup address"
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Contact Person</label>
        <input
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.contactPerson ? "border-red-500" : "border-gray-300"}`}
          name="contactPerson"
          type="text"
          value={foodData.contactPerson}
          onChange={handleChange}
          placeholder="Enter contact person name (optional)"
        />
        {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Contact Number</label>
        <input
          className={`shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${errors.contactNumber ? "border-red-500" : "border-gray-300"}`}
          name="contactNumber"
          type="tel"
          value={foodData.contactNumber}
          onChange={handleChange}
          placeholder="Enter 10-digit contact number (optional)"
          maxLength={10}
          inputMode="numeric"
        />
        {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Additional Notes</label>
        <textarea
          className="shadow-md border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border-gray-300"
          name="notes"
          value={foodData.notes}
          onChange={handleChange}
          placeholder="Any additional information (optional)"
          rows="2"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 font-semibold mb-2">Upload Image</label>
        {foodData.image ? (
          <div className="relative w-full h-40">
            <img
              src={URL.createObjectURL(foodData.image)}
              alt="Food Preview"
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
            <button
              onClick={handleDeleteImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300"
            >
              <FaTrash size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div {...getRootProps()} className="flex flex-col items-center cursor-pointer mb-2">
              <input {...getInputProps()} />
              <FaImage className="text-gray-400 mb-2 text-2xl" />
              <p className="text-gray-600 text-sm">Drop image or click to upload</p>
            </div>
            <label className="flex items-center cursor-pointer text-gray-600 text-sm hover:text-blue-500 transition-all duration-300">
              <FaCamera className="mr-2" />
              <span>Take a photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Buttons directly after Upload Image */}
      <div className="flex justify-between mt-4">
        {step > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handlePrevious}
            className="flex items-center px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            <FaClock className="mr-2" />
            Previous
          </motion.button>
        )}
        {step < 3 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleNext}
            className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ml-auto"
          >
            Next
            <FaClock className="ml-2" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex items-center px-6 py-2 text-white bg-gradient-to-r from-green-500 to-green-700 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 ml-auto"
          >
            Add Food
            <FontAwesomeIcon icon={faBowlFood} className="ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto"
    >
      <div className="bg-gradient-to-r from-green-500 to-yellow-500 p-6 text-white text-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center mb-4"
        >
          <FaLeaf className="text-4xl animate-pulse mr-3" />
          <h1 className="text-2xl font-bold">Donate Food, Save Lives</h1>
        </motion.div>
        <div className="mt-4 flex justify-center gap-4">
          <FaUtensils className="text-2xl animate-bounce" />
          <FaHeart className="text-2xl animate-bounce delay-100" />
          <FaBoxOpen className="text-2xl animate-bounce delay-200" />
        </div>
      </div>

      <div className="p-6 last:mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {step === 1 && "Basic Details"}
            {step === 2 && "Timing & Storage"}
            {step === 3 && "Location & Contact"}
          </h2>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {["Basic Details", "Timing & Storage", "Location & Contact"].map((label, index) => (
              <div
                key={label}
                className={`flex flex-col items-center w-1/3 ${
                  index + 1 < step ? "text-green-600" : index + 1 === step ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 shadow-md ${
                    index + 1 < step ? "bg-green-100" : index + 1 === step ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  {index + 1 < step ? (
                    <FaUtensils className="text-green-600" />
                  ) : index + 1 === step ? (
                    <FaClock className="text-blue-600" />
                  ) : (
                    <FaMapMarkerAlt className="text-gray-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-center">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 flex rounded-full overflow-hidden bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-green-500 to-green-600"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "33.33%" }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderStep1()}
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderStep2()}
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderStep3()}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm w-full"
            >
              <FaHeart className={`text-4xl mx-auto mb-4 animate-pulse ${popupMessage.includes("Success") ? "text-green-500" : "text-red-500"}`} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{popupMessage.includes("Success") ? "Food Added Successfully" : "Error"}</h2>
              <p className="text-gray-600 text-sm">{popupMessage}</p>
              <div className="flex justify-center gap-4 mt-6">
                {popupMessage.includes("Success") ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setFoodData({
                          restaurantName: "",
                          foodType: "Prepared Meals",
                          quantity: "",
                          quantityType: "kg",
                          expiryDate: "",
                          pickupTime: "",
                          storageInstructions: "Refrigerated",
                          notes: "",
                          location: "",
                          contactPerson: "",
                          contactNumber: "",
                          image: null,
                          status: "pending",
                        });
                        setStep(1);
                        setShowPopup(false);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300">
                      Add Another
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate("/food-cart")}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg hover:from-green-700 hover:to-green-900 transition-all duration-300">
                      Go to Food Cart
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowPopup(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300">
                    Close
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddFood;
   