import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TrendingUp, Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../src/services/auth';
import RotatingText from '../src/components/RotatingText';
import { toast } from 'react-toastify';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      console.log('Login - API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      const response = await authService.login(formData.email, formData.password);
      console.log('Login response:', response);
      const user = response.user || JSON.parse(localStorage.getItem('user') || '{}');
      
      // Always redirect to home page
      router.push('/');
      
      // Check if user is admin and show toast notification
      if (user.is_staff === true || user.role === 'admin') {
        toast.success('Welcome back, Admin! You have administrator privileges.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
      
      // Small delay before reload to allow toast to show
      setTimeout(() => {
        window.location.reload(); // Reload to update navbar
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error URL:', error.config?.url);
      console.error('Login error response:', error.response);
      // Extract error message from backend response
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.response?.data?.non_field_errors?.[0] ||
                          error.message ||
                          'Invalid credentials. Please try again.';
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 cursor-target">
            <TrendingUp className="h-12 w-12 text-white" />
            <span className="text-3xl font-bold text-white">PredictHub</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 cursor-target">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center flex items-center justify-center gap-2 flex-wrap">
            <span>Welcome</span>
            <RotatingText
              texts={['Back', 'Again', 'Home', 'Now']}
              mainClassName="px-2 sm:px-2 md:px-3 bg-blue-500 dark:bg-blue-600 text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg font-bold"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </h2>

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2 border cursor-target ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-2 border cursor-target ${
                    errors.password
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-target"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-target"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-target"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-target"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold cursor-target"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

