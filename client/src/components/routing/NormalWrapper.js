import React from 'react';
import { Navigate } from 'react-router-dom';

const NormalWrapper = ({ children }) => {
    const sub = JSON.parse(localStorage.getItem("sub"));
    // if subscriiption exists and it is in the "nurmal" plan, render the children, otherwise redirect to the home page
    return sub === "normal" ? children : <Navigate to="/" />;
}

export default NormalWrapper;