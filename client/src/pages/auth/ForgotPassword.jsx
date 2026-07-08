import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Please enter your email address');
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return toast.error('Please enter a valid email address');
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success(response.data.message || 'Reset link sent successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to request password reset. Please try again.';
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
        {!isSent ? (
          <>
            <div>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <FiMail className="w-8 h-8" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900">
                Forgot password?
              </h2>
              <p className="mt-2 text-center text-sm text-surface-600">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="input-label">College Email ID</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field"
                    placeholder="you@srmist.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center btn-primary py-3 text-base"
                >
                  {isSubmitting ? 'Sending instructions...' : 'Send reset link'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                <FiArrowLeft /> Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-md animate-scaleUp">
              <FiCheckCircle className="w-10 h-10" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-surface-900">
              Check your email
            </h2>
            <p className="mt-4 text-sm text-surface-600 leading-relaxed">
              If an account is registered with <strong className="text-surface-950 font-semibold">{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="mt-2 text-xs text-surface-500">
              Be sure to check your spam folder if you don't receive it in a few minutes.
            </p>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => setIsSent(false)}
                className="w-full flex justify-center btn-secondary py-3 text-base"
              >
                Try another email
              </button>
              <div>
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  <FiArrowLeft /> Back to sign in
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
