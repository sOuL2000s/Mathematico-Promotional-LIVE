import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Show a loading spinner while checking auth status
  }

  return currentUser ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;