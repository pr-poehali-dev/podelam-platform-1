import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NameStep, EmailStep, OtpStep, CityStep, SEND_OTP_URL, VERIFY_OTP_URL } from './RegistrationSteps';
import getDeviceToken from '@/lib/deviceToken';

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  setIsAuthenticated: (value: boolean) => void;
  setShowGameSettings: (value: boolean) => void;
}

type AuthMode = 'choose' | 'register' | 'login';

export const AuthModal = ({ 
  showAuthModal, 
  setShowAuthModal, 
  setIsAuthenticated, 
  setShowGameSettings 
}: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const [registrationStep, setRegistrationStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser && showAuthModal) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      const params = new URLSearchParams(window.location.search);
      if (!params.get('invite')) {
        setShowGameSettings(true);
      }
    }
  }, [showAuthModal, setIsAuthenticated, setShowAuthModal, setShowGameSettings]);



  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const sendOtp = useCallback(async () => {
    setIsSending(true);
    setOtpError('');
    try {
      const res = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (authMode === 'login') {
          setRegistrationStep(2);
        } else {
          setRegistrationStep(4);
        }
        setResendTimer(60);
      } else {
        setOtpError(data.error || 'Не удалось отправить код');
      }
    } catch {
      setOtpError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setIsSending(false);
    }
  }, [userEmail, authMode]);

  const verifyOtp = useCallback(async () => {
    setIsVerifying(true);
    setOtpError('');
    try {
      const payload: Record<string, string> = {
        email: userEmail.trim().toLowerCase(),
        code: otpCode.trim(),
        device_token: getDeviceToken(),
      };
      if (authMode === 'login') {
        payload.mode = 'login';
      } else {
        payload.mode = 'register';
        payload.name = userName.trim();
        payload.city = selectedCity;
      }

      const res = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = data.user;
        const userData = {
          name: user.username,
          email: userEmail.trim().toLowerCase(),
          city: user.city || selectedCity,
          rating: user.rating,
          id: user.id,
          userId: user.user_code || '',
          games_played: user.games_played,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws
        };
        localStorage.setItem('chessUser', JSON.stringify(userData));
        setIsAuthenticated(true);
        setShowAuthModal(false);
        const params = new URLSearchParams(window.location.search);
        if (!params.get('invite')) {
          setShowGameSettings(true);
        }
        resetForm();
      } else {
        if (data.error === 'User not found') {
          setOtpError('Аккаунт с этим email не найден. Зарегистрируйтесь.');
        } else if (data.error === 'Invalid code') {
          setOtpError('Неверный код. Проверьте и попробуйте снова.');
        } else if (data.error === 'Code expired or not found') {
          setOtpError('Код истёк. Запросите новый.');
        } else {
          setOtpError(data.error || 'Ошибка проверки кода');
        }
      }
    } catch {
      setOtpError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setIsVerifying(false);
    }
  }, [userEmail, otpCode, userName, selectedCity, authMode, setIsAuthenticated, setShowAuthModal, setShowGameSettings]);

  const resetForm = () => {
    setAuthMode('choose');
    setRegistrationStep(1);
    setUserName('');
    setUserEmail('');
    setOtpCode('');
    setSelectedCity('');
    setCitySearch('');
    setOtpError('');
  };

  if (!showAuthModal) return null;

  const handleNextStep = () => {
    if (authMode === 'login') {
      if (registrationStep === 1 && userEmail.trim() && userEmail.includes('@')) {
        sendOtp();
      } else if (registrationStep === 2 && otpCode.replace(/\s/g, '').length === 6) {
        verifyOtp();
      }
      return;
    }

    if (registrationStep === 1 && userName.trim()) {
      setRegistrationStep(2);
    } else if (registrationStep === 2 && selectedCity) {
      setRegistrationStep(3);
    } else if (registrationStep === 3 && userEmail.trim() && userEmail.includes('@')) {
      sendOtp();
    } else if (registrationStep === 4 && otpCode.replace(/\s/g, '').length === 6) {
      verifyOtp();
    }
  };

  const handleBack = () => {
    setOtpError('');
    if (authMode === 'login') {
      if (registrationStep === 2) {
        setRegistrationStep(1);
        setOtpCode('');
      } else {
        setAuthMode('choose');
        setRegistrationStep(1);
      }
      return;
    }

    if (registrationStep === 4) {
      setRegistrationStep(3);
      setOtpCode('');
    } else if (registrationStep === 1) {
      setAuthMode('choose');
    } else if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtpCode('');
    setOtpError('');
    sendOtp();
  };

  const getTitle = () => {
    if (authMode === 'choose') return 'Добро пожаловать';
    if (authMode === 'login') {
      return registrationStep === 1 ? 'Вход в аккаунт' : 'Введите код';
    }
    const titles: Record<number, string> = {
      1: 'Как вас зовут?',
      2: 'Ваш город',
      3: 'Электронная почта',
      4: 'Введите код'
    };
    return titles[registrationStep];
  };

  const totalSteps = authMode === 'login' ? 2 : 4;
  const showBack = authMode !== 'choose';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={() => { setShowAuthModal(false); resetForm(); }}>
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400"
              >
                <Icon name="ChevronLeft" size={24} />
              </Button>
            )}
            <CardTitle className="flex-1 text-center text-gray-900 dark:text-white">
              {getTitle()}
            </CardTitle>
            {showBack && <div className="w-10" />}
          </div>
          {authMode !== 'choose' && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className={`h-1.5 w-10 rounded-full transition-colors ${
                  registrationStep >= step ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {authMode === 'choose' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Icon name="Crown" size={40} className="text-white" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Играйте в шахматы онлайн с рейтингом
                </p>
              </div>
              <Button
                className="w-full gradient-primary border-0 text-white h-12"
                onClick={() => { setAuthMode('register'); setRegistrationStep(1); }}
              >
                <Icon name="UserPlus" className="mr-2" size={20} />
                Зарегистрироваться
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 dark:border-white/20 text-gray-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => { setAuthMode('login'); setRegistrationStep(1); }}
              >
                <Icon name="LogIn" className="mr-2" size={20} />
                Войти по email
              </Button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Вход привязан к email — вы всегда сможете вернуться к своему профилю
              </p>
            </div>
          )}

          {authMode === 'register' && registrationStep === 1 && (
            <NameStep
              userName={userName}
              setUserName={setUserName}
              handleNextStep={handleNextStep}
            />
          )}

          {authMode === 'register' && registrationStep === 2 && (
            <CityStep
              citySearch={citySearch}
              setCitySearch={setCitySearch}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              showCityDropdown={showCityDropdown}
              setShowCityDropdown={setShowCityDropdown}
              handleNextStep={handleNextStep}
            />
          )}

          {authMode === 'register' && registrationStep === 3 && (
            <EmailStep
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              handleNextStep={handleNextStep}
              isSending={isSending}
            />
          )}

          {authMode === 'register' && registrationStep === 4 && (
            <OtpStep
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              handleNextStep={handleNextStep}
              userEmail={userEmail}
              isVerifying={isVerifying}
              otpError={otpError}
              onResend={handleResend}
              resendTimer={resendTimer}
            />
          )}

          {authMode === 'login' && registrationStep === 1 && (
            <EmailStep
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              handleNextStep={handleNextStep}
              isSending={isSending}
            />
          )}

          {authMode === 'login' && registrationStep === 2 && (
            <OtpStep
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              handleNextStep={handleNextStep}
              userEmail={userEmail}
              isVerifying={isVerifying}
              otpError={otpError}
              onResend={handleResend}
              resendTimer={resendTimer}
            />
          )}

          {authMode !== 'choose' && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              {authMode === 'register' ? 'Регистрируясь, вы соглашаетесь с правилами сервиса' : 'Нет аккаунта? '}
              {authMode === 'login' && (
                <button
                  onClick={() => { setAuthMode('register'); setRegistrationStep(1); setOtpCode(''); setOtpError(''); }}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Зарегистрируйтесь
                </button>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};