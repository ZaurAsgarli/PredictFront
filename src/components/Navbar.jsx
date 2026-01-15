import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Trophy, User, LogOut, TrendingUp, Sparkles, Sun, Moon, Shield } from 'lucide-react';
import { authService } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  useEffect(() => {
    const currentUser = authService.getCurrentUserSync();
    setUser(currentUser);
    setIsAdmin(authService.isAdmin());
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router.pathname]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
    router.push('/login');
  };

  const handleAdminClick = () => {
    window.location.href = 'http://localhost:3001/admin';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-800/90 dark:bg-gray-900/90 shadow-large backdrop-blur-xl' 
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <TrendingUp className={`h-8 w-8 transition-colors duration-200 ${
                  scrolled 
                    ? 'text-white group-hover:text-gray-200' 
                    : 'text-primary-600 group-hover:text-primary-500'
                }`} />
                <Sparkles className={`h-3 w-3 absolute -top-1 -right-1 animate-pulse ${
                  scrolled ? 'text-yellow-400' : 'text-accent-500'
                }`} />
              </div>
              <span className={`text-2xl font-bold ${
                scrolled 
                  ? 'text-white' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                PredictHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled 
                  ? 'text-white hover:text-gray-200' 
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled 
                  ? 'text-white hover:text-gray-200' 
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              Events
            </Link>
            <Link
              href="/predictions"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled 
                  ? 'text-white hover:text-gray-200' 
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              My Predictions
            </Link>
            <Link
              href="/leaderboard"
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled 
                  ? 'text-white hover:text-gray-200' 
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Link>

            {/* Admin Button - Only visible to admins */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                  scrolled 
                    ? 'text-white hover:text-gray-200 bg-purple-600/80 hover:bg-purple-600' 
                    : 'text-purple-700 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-100 dark:bg-purple-900/30'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                scrolled 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === 'dark' ? (
                  <Sun className={`h-5 w-5 ${scrolled ? 'text-yellow-400' : 'text-yellow-500'}`} />
                ) : (
                  <Moon className={`h-5 w-5 ${scrolled ? 'text-gray-300' : 'text-gray-600'}`} />
                )
              )}
            </button>

            {user ? (
              <div className={`flex items-center space-x-3 ml-4 pl-4 border-l ${
                scrolled ? 'border-gray-600' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <Link
                  href="/profile"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                    scrolled 
                      ? 'text-white hover:text-gray-200' 
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    scrolled 
                      ? 'bg-gray-600' 
                      : 'bg-primary-600'
                  }`}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 p-2 rounded-xl transition-all duration-200 hover:bg-error-50 dark:hover:bg-error-900/20 ${
                    scrolled 
                      ? 'text-white hover:text-gray-200' 
                      : 'text-gray-700 hover:text-error-600 dark:text-gray-300 dark:hover:text-error-400'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className={`flex items-center space-x-3 ml-4 pl-4 border-l ${
                scrolled ? 'border-gray-600' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                    scrolled 
                      ? 'text-white hover:text-gray-200' 
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled 
                  ? 'text-white hover:text-gray-200' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className={`md:hidden border-t ${
          scrolled 
            ? 'bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-700/20' 
            : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                scrolled
                  ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                scrolled
                  ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/predictions"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                scrolled
                  ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              My Predictions
            </Link>
            <Link
              href="/leaderboard"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                scrolled
                  ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Leaderboard
            </Link>
            {/* Admin Button for Mobile - Only visible to admins */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  handleAdminClick();
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  scrolled
                    ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                    : 'text-purple-700 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </button>
            )}
            {/* Theme Toggle for Mobile */}
            <div className={`border-t pt-4 mt-4 ${
              scrolled ? 'border-gray-700/20' : 'border-gray-200/20 dark:border-gray-700/20'
            }`}>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  scrolled
                    ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                    : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                {mounted && (
                  theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 text-gray-600" />
                      <span>Dark Mode</span>
                    </>
                  )
                )}
              </button>
            </div>

            {user ? (
              <>
                <div className={`border-t pt-4 mt-4 ${
                  scrolled ? 'border-gray-700/20' : 'border-gray-200/20 dark:border-gray-700/20'
                }`}>
                  <Link
                    href="/profile"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      scrolled
                        ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      scrolled
                        ? 'text-red-300 hover:text-red-200 hover:bg-red-900/20'
                        : 'text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20'
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className={`border-t pt-4 mt-4 space-y-2 ${
                scrolled ? 'border-gray-700/20' : 'border-gray-200/20 dark:border-gray-700/20'
              }`}>
                <Link
                  href="/login"
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    scrolled
                      ? 'text-white hover:text-gray-200 hover:bg-gray-700/50'
                      : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block btn-primary text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

