import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

const ProgressBar = ({ status }) => {
  const steps = ["Requested", "Accepted", "Person on the Way", "Completed"];
  const currentStep = steps.indexOf(status);
  const [progress, setProgress] = useState(0); // Removed <number> annotation

  // Simulate real-time progress animation
  useEffect(() => {
    const targetProgress = ((currentStep + 1) / steps.length) * 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        return prev + 1;
      });
    }, 15);
    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="w-full relative md:w-auto md:h-40 select-none">
      {/* Horizontal Layout (Mobile) */}
      <div className="md:hidden">
        <div className="w-full h-2 bg-gray-100 rounded-full absolute top-1 overflow-hidden shadow-md">
          <motion.div
            className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Pulsing Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-300/50 to-blue-500/50 rounded-full"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            {/* Moving Indicator with Trail */}
            {progress > 0 && progress < 100 && (
              <motion.div
                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-300/50"
                animate={{ x: [-8, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <FaMapMarkerAlt className="text-white text-xs" />
                <motion.div
                  className="absolute w-8 h-1 bg-blue-300/30 rounded-full"
                  style={{ left: "-2rem" }}
                  animate={{ opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="flex justify-between relative z-10 pt-6">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex flex-col items-center relative"
              style={{ width: `${100 / steps.length}%` }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 shadow-lg ${
                  index <= currentStep
                    ? "bg-blue-500 text-white ring-2 ring-blue-200"
                    : "bg-white border-2 border-gray-300 text-gray-600"
                }`}
                whileHover={{ scale: 1.2 }}
                animate={
                  index === currentStep
                    ? {
                        scale: [1, 1.15, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0.5)",
                          "0 0 8px 4px rgba(59, 130, 246, 0.5)",
                        ],
                      }
                    : {}
                }
                transition={
                  index === currentStep
                    ? { repeat: Infinity, duration: 2 }
                    : undefined
                }
              >
                {index <= currentStep ? (
                  <FaCheckCircle className="text-lg" />
                ) : (
                  <span className="text-lg">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={`text-sm font-semibold transition-colors duration-300 ${
                  index <= currentStep ? "text-blue-500" : "text-gray-600"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical Layout (Desktop) */}
      <div className="hidden md:flex md:flex-col md:items-start md:space-y-6 relative">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center relative">
            {/* Vertical Line */}
            {index < steps.length - 1 && (
              <motion.div
                className={`absolute w-1 h-10 left-3.5 z-0 rounded-full overflow-hidden ${
                  index < currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
                style={{ top: "1.5rem" }}
              >
                {index === currentStep && (
                  <motion.div
                    className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600"
                    initial={{ height: 0 }}
                    animate={{ height: `${progress % 25}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="absolute bottom-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-300/50 -left-1.5"
                      animate={{ y: [-8, 0], scale: [1, 1.2, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                    >
                      <FaMapMarkerAlt className="text-white text-xs" />
                      <motion.div
                        className="absolute w-1 h-8 bg-blue-300/30 rounded-full"
                        style={{ top: "-2rem" }}
                        animate={{ opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
            {/* Step Circle */}
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 z-10 shadow-lg ${
                index <= currentStep
                  ? "bg-blue-500 text-white ring-2 ring-blue-200"
                  : "bg-white border-2 border-gray-300 text-gray-600"
              }`}
              whileHover={{ scale: 1.2 }}
              animate={
                index === currentStep
                  ? {
                      scale: [1, 1.15, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.5)",
                        "0 0 8px 4px rgba(59, 130, 246, 0.5)",
                      ],
                    }
                  : {}
              }
              transition={
                index === currentStep
                  ? { repeat: Infinity, duration: 2 }
                  : undefined
              }
            >
              {index <= currentStep ? (
                <FaCheckCircle className="text-lg" />
              ) : (
                <span className="text-lg">{index + 1}</span>
              )}
            </motion.div>
            {/* Step Label */}
            <div
              className={`ml-4 transition-colors duration-300 z-10 font-semibold text-base ${
                index <= currentStep ? "text-blue-500" : "text-gray-600"
              }`}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;