import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for admin login and password visibility

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Check if already logged in

  if (currentUser) {
    navigate('/admin/dashboard', { replace: true });
    return null; // Don't render login form if already logged in
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Failed to log in. Please check your credentials.";
      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-background px-4 py-8">
      <div className="bg-medium-dark p-8 rounded-xl shadow-2xl w-full max-w-md border border-secondary animate-fade-in">
        <div className="text-accent text-6xl text-center mb-6">
          <FaUserShield className="mx-auto" />
        </div>
        <h1 className="text-4xl font-bold text-light-text mb-8 text-center">Admin Login</h1>
        {error && <ErrorDisplay message={error} />}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-secondary text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-3 px-4 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-secondary text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-3 px-4 pr-12 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-text hover:text-light-text focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-light-text font-bold py-3 px-8 rounded-lg w-full hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Log In'}
          </button>
        </form>
        <p className="text-center text-gray-text text-sm mt-6">
          Only authorized administrators can access this section.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;