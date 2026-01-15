"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Trophy, User, LogOut, TrendingUp, Sparkles, Shield, Sun, Moon } from "lucide-react";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Check localStorage for user
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setUser(parsed);
          setIsAdmin(parsed?.role === "ADMIN");
        } catch {
          // Fallback: best-effort
          setUser({ username: "User" });
          setIsAdmin(false);
        }
      }

      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false);
    window.location.href = "/login";
  };

  const handleAdminClick = () => {
    window.location.href = "http://localhost:3001/admin";
  };

  const handleConnectWallet = () => {
    // Simulate wallet connection
    const userId = `user_${Date.now()}`;
    localStorage.setItem("userId", userId);
    setUser({ id: userId, username: userId.substring(0, 8) });
    
    // Sync user with backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    }).catch(() => {
      // Silently fail if backend is offline
    });
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-800/90 dark:bg-gray-900/90 shadow-lg backdrop-blur-xl"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <TrendingUp
                  className={`h-8 w-8 transition-colors duration-200 ${
                    scrolled
                      ? "text-white group-hover:text-gray-200"
                      : "text-primary-600 group-hover:text-primary-500 dark:text-green-500"
                  }`}
                />
                <Sparkles
                  className={`h-3 w-3 absolute -top-1 -right-1 animate-pulse ${
                    scrolled ? "text-yellow-400" : "text-accent-500 dark:text-yellow-400"
                  }`}
                />
              </div>
              <span
                className={`text-2xl font-bold ${
                  scrolled
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                PredictBack
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled
                  ? "text-white hover:text-gray-200"
                  : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              } ${pathname === "/" ? "bg-primary-50 dark:bg-primary-900/20" : ""}`}
            >
              Markets
            </Link>
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminClick}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-2 ${
                  scrolled
                    ? "text-white hover:text-gray-200"
                    : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                scrolled
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className={`h-5 w-5 ${scrolled ? "text-yellow-400" : "text-yellow-500"}`} />
              ) : (
                <Moon className={`h-5 w-5 ${scrolled ? "text-gray-300" : "text-gray-600"}`} />
              )}
            </button>

            {user ? (
              <div
                className={`flex items-center space-x-3 ml-4 pl-4 border-l ${
                  scrolled ? "border-gray-600" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                    scrolled
                      ? "text-white hover:text-gray-200"
                      : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      scrolled ? "bg-gray-600" : "bg-primary-600"
                    }`}
                  >
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 p-2 rounded-xl transition-all duration-200 hover:bg-error-50 dark:hover:bg-error-900/20 ${
                    scrolled
                      ? "text-white hover:text-gray-200"
                      : "text-gray-700 hover:text-error-600 dark:text-gray-300 dark:hover:text-error-400"
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div
                className={`flex items-center space-x-3 ml-4 pl-4 border-l ${
                  scrolled ? "border-gray-600" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <button
                  onClick={handleConnectWallet}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                scrolled
                  ? "text-white hover:text-gray-200"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className={`md:hidden border-t ${
            scrolled
              ? "bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-700/20"
              : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20"
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                scrolled
                  ? "text-white hover:text-gray-200 hover:bg-gray-700/50"
                  : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Markets
            </Link>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  handleAdminClick();
                  setIsOpen(false);
                }}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center gap-2 ${
                  scrolled
                    ? "text-white hover:text-gray-200 hover:bg-gray-700/50"
                    : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            )}

            {user ? (
              <>
                <div
                  className={`border-t pt-4 mt-4 ${
                    scrolled ? "border-gray-700/20" : "border-gray-200/20 dark:border-gray-700/20"
                  }`}
                >
                  <div
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium ${
                      scrolled
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span>{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      scrolled
                        ? "text-red-300 hover:text-red-200 hover:bg-red-900/20"
                        : "text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20"
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div
                className={`border-t pt-4 mt-4 space-y-2 ${
                  scrolled ? "border-gray-700/20" : "border-gray-200/20 dark:border-gray-700/20"
                }`}
              >
                <button
                  onClick={() => {
                    handleConnectWallet();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-base font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
            
            {/* Theme Toggle for Mobile */}
            <div
              className={`border-t pt-4 mt-4 ${
                scrolled ? "border-gray-700/20" : "border-gray-200/20 dark:border-gray-700/20"
              }`}
            >
              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  scrolled
                    ? "text-white hover:text-gray-200 hover:bg-gray-700/50"
                    : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                }`}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 text-gray-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
