import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { FiLock, FiArrowLeft, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  // Password requirements state
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // Validate password as user types
    setRequirements({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const allRequirementsMet = Object.values(requirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTokenError('');

    if (!allRequirementsMet) {
      return toast.error('Please meet all password requirements');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      toast.success(response.data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Token is invalid or has expired.';
      setTokenError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 glass-card p-8 sm:p-10 z-10 animate-fadeIn">
        {isSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-md">
              <FiCheckCircle className="w-10 h-10" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-surface-900">
              Password Reset Success!
            </h2>
            <p className="mt-4 text-sm text-surface-600 leading-relaxed">
              Your password has been changed successfully. You will be redirected to the sign-in page in a few seconds.
            </p>
            <div className="mt-8">
              <Link to="/login" className="w-full flex justify-center btn-primary py-3 text-base">
                Go to Sign In Now
              </Link>
            </div>
          </div>
        ) : tokenError ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-md">
              <FiX className="w-10 h-10" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-surface-900">
              Invalid or Expired Link
            </h2>
            <p className="mt-4 text-sm text-surface-600 leading-relaxed">
              {tokenError || 'This password reset link is invalid or has expired. Password reset links expire after 1 hour.'}
            </p>
            <div className="mt-8 space-y-4">
              <Link to="/forgot-password" className="w-full flex justify-center btn-primary py-3 text-base">
                Request new link
              </Link>
              <div>
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  <FiArrowLeft /> Back to sign in
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <FiLock className="w-8 h-8" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900">
                Set new password
              </h2>
              <p className="mt-2 text-center text-sm text-surface-600">
                Please enter a secure password for your account.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="input-label">New Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Password strength checklist */}
              <div className="bg-surface-100 p-4 rounded-xl space-y-2 border border-surface-200">
                <p className="text-xs font-semibold text-surface-700">Password requirements:</p>
                <ul className="text-xs space-y-1.5 text-surface-600">
                  <li className="flex items-center gap-1.5">
                    {requirements.length ? <FiCheck className="text-green-600" /> : <FiX className="text-red-500" />}
                    At least 6 characters
                  </li>
                  <li className="flex items-center gap-1.5">
                    {requirements.uppercase ? <FiCheck className="text-green-600" /> : <FiX className="text-red-500" />}
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-1.5">
                    {requirements.lowercase ? <FiCheck className="text-green-600" /> : <FiX className="text-red-500" />}
                    At least one lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-1.5">
                    {requirements.number ? <FiCheck className="text-green-600" /> : <FiX className="text-red-500" />}
                    At least one number (0-9)
                  </li>
                  <li className="flex items-center gap-1.5">
                    {requirements.special ? <FiCheck className="text-green-600" /> : <FiX className="text-red-500" />}
                    At least one special character (e.g., !@#$%^&*)
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !allRequirementsMet}
                  className="w-full flex justify-center btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Resetting password...' : 'Reset password'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
