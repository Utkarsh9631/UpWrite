import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * This component handles the authentication callback from the main site.
 * It grabs the token from the URL, saves it to localStorage,
 * and then redirects to the dashboard's home page.
 */
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the token from the URL query parameter
    const token = searchParams.get('token');
    
    if (token) {
      // Save the token to the dashboard's localStorage
      localStorage.setItem('token', token);
      
      // Redirect to the dashboard home page
      navigate('/');
    } else {
      // No token found, just go to the home page (or a login page if you had one)
      console.error("No token found in callback.");
      navigate('/');
    }
  }, [searchParams, navigate]); // Run this effect when the component loads

  // Show a simple loading message while redirecting
  return <div>Loading...</div>;
}

export default AuthCallback;