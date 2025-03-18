// src/hooks/use-toast.js
import { toast } from 'react-toastify';

const useToast = () => {
  const showToast = (message, options = {}) => {
    toast(message, options);
  };

  return {
    showToast,
  };
};

export default useToast;