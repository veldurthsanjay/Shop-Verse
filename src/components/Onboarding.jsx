import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faGlobe, faStore, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

const Onboarding = () => {
  const navigate = useNavigate();
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onboardingSlides = [
    {
      title: "Welcome to FoodShare",
      description: "FoodShare connects restaurants with surplus food to food banks in need. With this app, I’ve created a way for you to reduce food waste and make a difference. Let’s get started!",
      icon: faHeart,
      color: "bg-gradient-to-br from-red-400 to-red-600",
    },
    {
      title: "Make an Impact",
      description: "Every year, billions of pounds of food go to waste while many go hungry. This app helps you bridge that gap and turn surplus food into something meaningful.",
      icon: faGlobe,
      color: "bg-gradient-to-br from-green-500 to-green-700",
    },
    {
      title: "For Restaurants",
      description: "Turn your extra food into donations effortlessly. I’ve designed this to simplify listing available food, setting pickup times, and ensuring food safety.",
      icon: faStore,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      title: "For Food Banks",
      description: "Easily find and claim surplus food nearby. I’ve built this to give you real-time notifications, pickup management, and impact tracking in one place.",
      icon: faHandsHelping,
      color: "bg-gradient-to-br from-orange-500 to-orange-700",
    }
  ];

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onboardingStep < onboardingSlides.length - 1) {
      setOnboardingStep(prev => prev + 1);
    }
    if (isRightSwipe && onboardingStep > 0) {
      setOnboardingStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setOnboardingStep(onboardingSlides.length - 1);
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const isLastSlide = onboardingStep === onboardingSlides.length - 1;

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-gray-100 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
    >
      <div className={`flex-1 flex flex-col items-center justify-between ${onboardingSlides[onboardingStep].color} text-white transition-all duration-500 ease-in-out p-6`}>
        {/* Top Section with Skip Button (only on first slide) */}
        {onboardingStep === 0 && (
          <div className="w-full flex justify-end pt-4">
            <button 
              className="text-white text-lg font-medium hover:opacity-80 transition-opacity"
              onClick={handleSkip}
            >
              Skip
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
          <FontAwesomeIcon 
            icon={onboardingSlides[onboardingStep].icon} 
            size="5x" 
            className="drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold tracking-tight">{onboardingSlides[onboardingStep].title}</h1>
          <p className="text-xl max-w-md leading-relaxed">{onboardingSlides[onboardingStep].description}</p>
        </div>

        {/* Bottom Controls */}
        <div className="w-full flex flex-col items-center pb-8 space-y-6">
          <div className="flex items-center justify-center space-x-2">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  index === onboardingStep ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                onClick={() => setOnboardingStep(index)}
              />
            ))}
          </div>

          {isLastSlide && (
            <button 
              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
  
};

export default Onboarding;