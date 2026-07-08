import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    year: '1st Year',
    registerNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, role };
      // Remove student specific fields if teacher
      if (role === 'teacher') {
        delete payload.year;
        delete payload.registerNumber;
      }

      await register(payload);
      navigate('/');
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-2xl w-full space-y-8 glass-card p-8 sm:p-10 z-10 animate-fadeIn my-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-surface-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-surface-600">
            Join CollabSphere to connect with your department
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="flex justify-center gap-6 mb-8">
            <label className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-xl border-2 transition-all ${
              role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-surface-200 hover:border-indigo-300'
            }`}>
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value)}
                className="hidden"
              />
              <span className="font-semibold">Student</span>
            </label>
            <label className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-xl border-2 transition-all ${
              role === 'teacher' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-surface-200 hover:border-indigo-300'
            }`}>
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === 'teacher'}
                onChange={(e) => setRole(e.target.value)}
                className="hidden"
              />
              <span className="font-semibold">Teacher</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="input-label">Full Name</label>
              <input
                id="name" name="name" type="text" required
                className="input-field" placeholder="John Doe"
                value={formData.name} onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="input-label">College Email ID</label>
              <input
                id="email" name="email" type="email" required
                className="input-field" placeholder="john.doe@srmist.edu.in"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="department" className="input-label">Department</label>
              <select
                id="department" name="department" required
                className="input-field"
                value={formData.department} onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            {role === 'student' && (
              <>
                <div>
                  <label htmlFor="year" className="input-label">Academic Year</label>
                  <select
                    id="year" name="year" required
                    className="input-field"
                    value={formData.year} onChange={handleChange}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="registerNumber" className="input-label">Register Number</label>
                  <input
                    id="registerNumber" name="registerNumber" type="text" required
                    className="input-field" placeholder="RA21110..."
                    value={formData.registerNumber} onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password" name="password" type="password" required minLength="6"
                className="input-field" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password" required minLength="6"
                className="input-field" placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center btn-primary py-3 text-base"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-surface-600">Already have an account? </span>
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
