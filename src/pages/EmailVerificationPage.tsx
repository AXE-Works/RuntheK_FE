import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Check, X, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/ade16fc310679880d8b27a51a4119372559298ac.png';
import { env } from '@/config/env';
import { setAccessToken } from '@/lib/auth/accessTokenStorage';

const API_BASE_URL = env.apiBaseUrl;

type VerificationStatus = 'verifying' | 'success' | 'error' | 'invalid';

export function EmailVerificationPage() {
  const { t } = useTranslation(['auth', 'common']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      // Validate URL parameters
      if (!token || !email) {
        setStatus('invalid');
        setErrorMessage(t('auth:verification.invalidLink'));
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Receive httpOnly cookie
          body: JSON.stringify({
            email: email,
            token: token,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Extract error message from BE response structure
          let message = t('auth:verification.failed');
          if (data.error) {
            if (data.error.message) {
              message = data.error.message;
            }
          } else if (data.message) {
            message = data.message;
          }
          throw new Error(message);
        }

        // Store accessToken (refreshToken is in httpOnly cookie)
        if (data.data?.token?.accessToken) {
          setAccessToken(data.data.token.accessToken);
        }

        setStatus('success');
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : t('auth:verification.failed'));
      }
    };

    verifyEmail();
  }, [token, email, t]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setErrorMessage(t('auth:verification.resent'));
      } else {
        const data = await res.json();
        throw new Error(data.error?.message || t('auth:verification.resendFailed'));
      }
    } catch (error) {
      console.error('Resend verification failed:', error);
      setErrorMessage(error instanceof Error ? error.message : t('auth:verification.resendFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="RuntheK"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('auth:verification.verifying')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('auth:verification.pleaseWait')}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            >
              <Check className="h-8 w-8 text-green-600" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('auth:verification.success')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('auth:verification.successMessage')}
            </p>
            <Button
              onClick={handleGoHome}
              className="w-full bg-black text-white hover:bg-gray-800 mt-4"
            >
              {t('auth:verification.goToHome')}
            </Button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
            >
              <X className="h-8 w-8 text-red-600" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('auth:verification.failed')}
            </h2>
            <p className="text-sm text-gray-600">
              {errorMessage}
            </p>
            <div className="space-y-2 mt-4">
              {email && (
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full"
                >
                  {t('auth:verification.resendEmail')}
                </Button>
              )}
              <Button
                onClick={handleGoHome}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {t('auth:verification.goToHome')}
              </Button>
            </div>
          </div>
        )}

        {/* Invalid Link State */}
        {status === 'invalid' && (
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center"
            >
              <Mail className="h-8 w-8 text-yellow-600" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('auth:verification.invalidTitle')}
            </h2>
            <p className="text-sm text-gray-600">
              {errorMessage || t('auth:verification.invalidLink')}
            </p>
            <Button
              onClick={handleGoHome}
              className="w-full bg-black text-white hover:bg-gray-800 mt-4"
            >
              {t('auth:verification.goToHome')}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
