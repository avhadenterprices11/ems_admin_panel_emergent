import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

// TEMPORARY: Authentication bypass for development
const AUTH_BYPASS_ENABLED = true; // Set to false to re-enable authentication

export const ProtectedRoute = ({ children }) => {
  // TEMPORARY: Skip authentication check during development
  if (AUTH_BYPASS_ENABLED) {
    return children;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
