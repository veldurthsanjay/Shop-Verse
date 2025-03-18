import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCheckCircle, faExclamationCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://localhost:8080";

const AuthForm = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isErrorPopup, setIsErrorPopup] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const namePattern = /^[a-zA-Z\s]{2,}$/;

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setFormData({ ...formData, email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const checkPasswordStrength = (password) => {
    if (!password) return "";
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength <= 2 ? "weak" : strength <= 4 ? "medium" : "strong";
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!emailPattern.test(formData.email)) tempErrors.email = "Invalid email address";
    if (!passwordPattern.test(formData.password))
      tempErrors.password = "Password must be 8+ characters with uppercase, lowercase, number, and special character";
    if (isSignup && !namePattern.test(formData.name))
      tempErrors.name = "Name must be 2+ characters, letters only";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const tempErrors = { ...errors };
    if (name === "email") {
      if (!emailPattern.test(value)) tempErrors.email = "Invalid email address";
      else delete tempErrors.email;
    } else if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
      if (!passwordPattern.test(value))
        tempErrors.password = "Password must be 8+ characters with uppercase, lowercase, number, and special character";
      else delete tempErrors.password;
    } else if (name === "name" && isSignup) {
      if (!namePattern.test(value)) tempErrors.name = "Name must be 2+ characters, letters only";
      else delete tempErrors.name;
    }
    setErrors(tempErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = `${API_BASE_URL}/api/auth/${isSignup ? "signup" : "login"}`;
      const body = isSignup ? formData : { email: formData.email, password: formData.password };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userId", data.id);
        if (rememberMe && !isSignup) {
          localStorage.setItem("rememberedEmail", formData.email);
          localStorage.setItem("rememberedPassword", formData.password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }
        setPopupMessage(`${isSignup ? "Signup" : "Login"} Successful!`);
        setIsErrorPopup(false);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/role");
        }, 2000);
      } else {
        setPopupMessage(data.message || "Authentication failed");
        setIsErrorPopup(true);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
        
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setPopupMessage("An error occurred. Try again.");
      setIsErrorPopup(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email first" });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      setPopupMessage(data.message || "Error sending reset link");
      setIsErrorPopup(!response.ok);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (error) {
      console.error("Forgot password error:", error);
      setPopupMessage("Error sending reset link.");
      setIsErrorPopup(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In clicked (not implemented).");
    setPopupMessage("Google Sign-In not implemented yet.");
    setIsErrorPopup(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const getStrengthColor = () =>
    passwordStrength === "weak"
      ? "bg-red-500"
      : passwordStrength === "medium"
      ? "bg-yellow-500"
      : passwordStrength === "strong"
      ? "bg-green-500"
      : "bg-gray-200";
  const getStrengthWidth = () =>
    passwordStrength === "weak"
      ? "w-1/3"
      : passwordStrength === "medium"
      ? "w-2/3"
      : passwordStrength === "strong"
      ? "w-full"
      : "w-0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50 px-4 sm:px-6 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100/40">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
          {isSignup ? "Sign Up 🌍" : "Login 🤝"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 transition-all duration-300">
          {isSignup && (
            <div
              className={`transition-all duration-300 ease-in-out ${
                isSignup ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full p-3 sm:p-4 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 shadow-sm h-12 sm:h-14 ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 sm:mt-2 pl-2">{errors.name}</p>}
            </div>
          )}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 sm:p-4 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 shadow-sm h-12 sm:h-14 ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 sm:mt-2 pl-2">{errors.email}</p>}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full p-3 sm:p-4 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 shadow-sm h-12 sm:h-14 pr-10 sm:pr-12 ${
                errors.password ? "border-red-500" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-4 top-5 text-gray-500 hover:text-orange-500 transition-colors duration-200 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-base sm:text-lg" />
            </button>
            {formData.password && (
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                  ></div>
                </div>
                <p className="text-xs mt-1 sm:mt-1.5 capitalize text-gray-600">
                  Strength: {passwordStrength || "None"}
                </p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1 sm:mt-2 pl-2">{errors.password}</p>}
          </div>
          {!isSignup && (
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>
          )}
          <button
            type="submit"
            className="w-full p-3 sm:p-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 shadow-md"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 sm:mt-6 flex items-center justify-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-sm"
        >
          <FontAwesomeIcon icon={faGoogle} className="mr-2 sm:mr-3 text-orange-500 text-base sm:text-lg" />
          <span className="text-gray-700 font-semibold text-sm sm:text-base">Sign in with Google</span>
        </button>
        <p className="mt-4 sm:mt-6 text-center text-sm text-gray-600">
          {isSignup ? "Have an account?" : "New here?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-200"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
        <div className="mt-4 sm:mt-6 text-center text-gray-400 text-[10px] sm:text-sm">
          Made with ❤️ for Food Sharing
        </div>
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl flex items-center space-x-3 sm:space-x-4 max-w-[90%] border border-gray-100/50 transition-all duration-300">
              <FontAwesomeIcon
                icon={isErrorPopup ? faExclamationCircle : faCheckCircle}
                className={isErrorPopup ? "text-red-500 text-2xl sm:text-3xl" : "text-green-500 text-2xl sm:text-3xl"}
              />
              <p className="text-gray-800 text-sm sm:text-xl font-medium text-center">{popupMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;