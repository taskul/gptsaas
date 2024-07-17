import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const authToken = localStorage.getItem("authToken");
    // if authToken exists, render the children, otherwise redirect to the login page
    return authToken ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;