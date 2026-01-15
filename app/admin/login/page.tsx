"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import api, { apiEndpoints } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token is valid
      verifyTokenAndRedirect();
    }
  }, []);

  const verifyTokenAndRedirect = async () => {
    try {
      const response = await api.get(apiEndpoints.me);
      const userData = response.data;
      
      if (userData.role === 'ADMIN' || userData.is_staff === true) {
        console.log('[AdminLogin] Token verified, user is admin, redirecting to dashboard');
        const redirect = searchParams.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        console.log('[AdminLogin] Token exists but user is not admin');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    } catch (err: any) {
      console.log('[AdminLogin] Token verification failed:', err.response?.status);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[AdminLogin] Attempting login for:', username);
      
      const response = await api.post(apiEndpoints.login, {
        username,
        password,
      });

      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token
      localStorage.setItem('token', token);
      if (user?.id) {
        localStorage.setItem('userId', user.id.toString());
      }

      console.log('[AdminLogin] Token stored successfully:', {
        hasToken: !!token,
        userId: user?.id,
        username: user?.username,
        is_staff: user?.is_staff,
        role: user?.role
      });

      // Verify user is admin
      const userResponse = await api.get(apiEndpoints.me);
      const userData = userResponse.data;

      if (userData.role === 'ADMIN' || userData.is_staff === true) {
        console.log('[AdminLogin] User verified as admin, redirecting to dashboard');
        const redirect = searchParams.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        console.error('[AdminLogin] User is not an admin');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setError('Access denied: Admin privileges required');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[AdminLogin] Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
