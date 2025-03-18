import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { PickupProvider } from './components/PickupContext.jsx';
import { ThemeProvider } from './components/ThemeContext'; 
import Onboarding from './components/Onboarding';
import RoleSelection from './components/RoleSelection';
import RestaurantNavigator from './components/RestaurantNavigator';
import FoodNavigator from './components/FoodNavigator';
import AuthForm from './components/AuthForm';
import Homee from './Pages/Homee';
import FoodCart from './Pages/FoodCart';
import AddFoods from './Pages/AddFoods';
import PickupStatus from './Pages/PickupStatus';
import Profilee from './Pages/Profilee';
import FoodHome from './Pages/FoodHome';
import FindFood from './Pages/FindFood';
import NearByFood from './Pages/NearByFood';
import Pickups from './Pages/Pickups';
import FoodProfile from './Pages/FoodProfile';
import CompletedPickups from './components/CompletedPickups';

const ConditionalNavbar = ({ userType }) => {
  const location = useLocation();
  const preRoleRoutes = ['/', '/auth', '/role'];

  const shouldShowNavbar = !preRoleRoutes.includes(location.pathname);

  return shouldShowNavbar ? (
    <>
      {userType === 'donor' && <RestaurantNavigator />}
      {userType === 'receiver' && <FoodNavigator />}
    </>
  ) : null;
};

const App = () => {
  const [userType, setUserType] = useState(() => {
    const storedType = localStorage.getItem('userType');
    console.log('Initial userType from localStorage:', storedType);
    return storedType || null;
  });

  useEffect(() => {
    if (userType) {
      localStorage.setItem('userType', userType);
      console.log('Saved userType to localStorage:', userType);
    }
  }, [userType]);

  return (
    <ThemeProvider> {/* Wrap everything with ThemeProvider */}
      <PickupProvider>
        <Router>
          <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Onboarding />} />
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/role" element={<RoleSelection setUserType={setUserType} />} />
                {userType === 'donor' && (
                  <>
                    <Route path="/home" element={<Homee />} />
                    <Route path="/food-cart" element={<FoodCart />} />
                    <Route path="/add" element={<AddFoods />} />
                    <Route path="/pickup-status" element={<PickupStatus />} />
                    <Route path="/profile" element={<Profilee />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </>
                )}
                {userType === 'receiver' && (
                  <>
                    <Route path="/home" element={<FoodHome />} />
                    <Route path="/find-food" element={<FindFood />} />
                    <Route path="/near-by-food" element={<NearByFood />} />
                    <Route path="/pickups" element={<Pickups />} />
                    <Route path="/completed-pickups" element={<CompletedPickups />} />
                    <Route path="/profile" element={<FoodProfile />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </>
                )}
                {userType === null && (
                  <Route path="*" element={<Navigate to="/" replace />} />
                )}
              </Routes>
            </div>
            <ConditionalNavbar userType={userType} />
          </div>
        </Router>
      </PickupProvider>
    </ThemeProvider>
  );
};

export default App;