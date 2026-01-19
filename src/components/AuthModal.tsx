import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Mail, Lock, User, Globe, Check, AlertCircle } from 'lucide-react';
import logo from '@/assets/ade16fc310679880d8b27a51a4119372559298ac.png';

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, config: { theme?: string; size?: string; width?: number; text?: string; click_listener?: () => void }) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' }
];

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { t } = useTranslation(['auth', 'common']);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });

  // Handle Google credential response
  const handleGoogleCredentialResponse = useCallback(async (response: { credential: string }) => {
    if (!response?.credential) {
      setAuthError(t('auth:errors.googleNoCredential'));
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Extract error message from BE response structure
        let errorMessage = t('auth:errors.googleFailed');
        if (data.error) {
          if (data.error.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
            errorMessage = data.error.details.map((d: { field: string; message: string }) => d.message).join('. ');
          } else if (data.error.message) {
            errorMessage = data.error.message;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      // Store tokens
      localStorage.setItem('accessToken', data.data.token.accessToken);
      localStorage.setItem('refreshToken', data.data.token.refreshToken);

      // Create user object from response
      const user = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        country: data.data.user.country || '',
        avatar: data.data.user.avatarUrl,
        provider: 'google',
        role: data.data.user.role,
      };

      onAuthSuccess(user);
      onClose();
    } catch (error) {
      console.error('Google authentication failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onAuthSuccess, onClose]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!isOpen || !GOOGLE_CLIENT_ID) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            use_fedcm_for_prompt: false,
            ux_mode: 'popup',
          });
        } catch (error) {
          console.error('Google initialization failed:', error);
        }
      }
    };

    // Check if Google script is already loaded
    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGoogle();
          clearInterval(checkGoogle);
        }
      }, 100);

      // Cleanup after 5 seconds
      setTimeout(() => clearInterval(checkGoogle), 5000);
    }

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [isOpen, handleGoogleCredentialResponse]);

  // Ref for Google button container
  const googleButtonRef = React.useRef<HTMLDivElement>(null);
  const signupGoogleButtonRef = React.useRef<HTMLDivElement>(null);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  // Render Google Sign-In button
  useEffect(() => {
    if (!isOpen || !GOOGLE_CLIENT_ID) return;

    const renderButtons = () => {
      if (!window.google?.accounts?.id) return;

      // Render login tab button
      if (googleButtonRef.current && !googleButtonRef.current.hasChildNodes()) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
          }
        );
      }

      // Render signup tab button
      if (signupGoogleButtonRef.current && !signupGoogleButtonRef.current.hasChildNodes()) {
        window.google.accounts.id.renderButton(
          signupGoogleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
          }
        );
      }

      setGoogleButtonRendered(true);
    };

    // Wait for Google SDK and DOM to be ready
    const attemptRender = () => {
      if (window.google?.accounts?.id) {
        // Small delay to ensure refs are attached
        setTimeout(renderButtons, 100);
      }
    };

    attemptRender();
    const interval = setInterval(attemptRender, 200);

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  // Reset button state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGoogleButtonRendered(false);
      // Clear button containers
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
      if (signupGoogleButtonRef.current) {
        signupGoogleButtonRef.current.innerHTML = '';
      }
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setAuthError(null);

    if (!GOOGLE_CLIENT_ID) {
      setAuthError(t('auth:errors.googleNotConfigured'));
      return;
    }

    if (!window.google?.accounts?.id) {
      setAuthError(t('auth:errors.googleUnavailable'));
      return;
    }

    // Trigger Google One Tap prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        setAuthError(t('auth:errors.googlePopupBlocked'));
      }
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Extract error message from BE response structure
        let errorMessage = t('auth:errors.loginFailed');
        if (data.error) {
          if (data.error.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
            errorMessage = data.error.details.map((d: { field: string; message: string }) => d.message).join('. ');
          } else if (data.error.message) {
            errorMessage = data.error.message;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      // Store tokens
      localStorage.setItem('accessToken', data.data.token.accessToken);
      localStorage.setItem('refreshToken', data.data.token.refreshToken);

      const user = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        country: data.data.user.country || '',
        avatar: data.data.user.avatarUrl,
        provider: 'email',
        role: data.data.user.role,
      };

      onAuthSuccess(user);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError(t('auth:errors.passwordMismatch'));
      return;
    }

    if (signupForm.password.length < 8) {
      setAuthError(t('auth:errors.invalidPassword'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          country: signupForm.country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Extract error message from BE response structure
        let errorMessage = t('auth:errors.signupFailed');
        if (data.error) {
          // Check for field-specific validation errors
          if (data.error.details && Array.isArray(data.error.details) && data.error.details.length > 0) {
            errorMessage = data.error.details.map((d: { field: string; message: string }) => d.message).join('. ');
          } else if (data.error.message) {
            errorMessage = data.error.message;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      setEmailSent(true);
    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    // Note: In real implementation, user clicks link in email
    // This button is for demo/testing - actual verification happens via email link
    setAuthError(t('auth:verification.checkInbox'));
  };

  if (emailSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex justify-center mb-2">
              <img 
                src={logo} 
                alt="RuntheK - Your Personal Korea Travel Assistant" 
                className="h-8 w-auto object-contain"
              />
            </div>
            <DialogTitle className="text-center">{t('auth:verification.title')}</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-600">
              {t('auth:verification.subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">{t('auth:messages.verificationSent')}</h3>
              <p className="text-sm text-gray-600">
                {t('auth:verification.checkInboxSent')} <strong>{signupForm.email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                {t('auth:verification.checkInboxAction')}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyEmail}
                disabled={isLoading}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {isLoading ? t('common:messages.loading') : t('auth:verification.verified')}
              </Button>

              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                {t('auth:verification.useDifferentEmail')}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <img 
              src={logo} 
              alt="RuntheK - Your Personal Korea Travel Assistant" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <DialogTitle className="text-center">{t('auth:login.title')}</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            {t('auth:login.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">{t('auth:login.submit')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth:signup.submit')}</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            {authError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign-In Button Container */}
            <div
              ref={googleButtonRef}
              className="w-full flex justify-center"
              style={{ minHeight: '44px' }}
            />

            {/* Fallback if Google button doesn't render */}
            {!googleButtonRendered && (
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth:login.google')}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth:login.orDivider')}</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t('auth:login.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('auth:login.emailPlaceholder')}
                    className="pl-10 border-gray-300"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">{t('auth:login.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t('auth:login.password')}
                    className="pl-10 border-gray-300"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {isLoading ? t('common:messages.loading') : t('auth:login.submit')}
              </Button>
            </form>
          </TabsContent>
          
          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4">
            {authError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign-In Button Container */}
            <div
              ref={signupGoogleButtonRef}
              className="w-full flex justify-center"
              style={{ minHeight: '44px' }}
            />

            {/* Fallback if Google button doesn't render */}
            {!googleButtonRendered && (
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth:login.google')}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth:login.orDivider')}</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">{t('auth:signup.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('auth:signup.name')}
                    className="pl-10 border-gray-300"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">{t('auth:signup.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth:login.emailPlaceholder')}
                    className="pl-10 border-gray-300"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-country">{t('auth:signup.country')}</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="signup-country"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    value={signupForm.country}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, country: e.target.value }))}
                    required
                  >
                    <option value="">{t('auth:signup.selectCountry')}</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth:signup.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('auth:signup.password')}
                      className="pl-10 border-gray-300"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">{t('auth:signup.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder={t('auth:signup.confirmPassword')}
                      className="pl-10 border-gray-300"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {isLoading ? t('common:messages.loading') : t('auth:signup.submit')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-xs text-gray-500 mt-4">
          {t('auth:signup.agreeTerms')}
        </div>
      </DialogContent>
    </Dialog>
  );
}