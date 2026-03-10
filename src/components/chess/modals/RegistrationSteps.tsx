import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { popularCities, allCities, cityRegions } from '@/components/chess/data/cities';

import API from '@/config/api';
const SEND_OTP_URL = API.sendOtp;
const VERIFY_OTP_URL = API.verifyOtp;

interface NameStepProps {
  userName: string;
  setUserName: (value: string) => void;
  handleNextStep: () => void;
}

export const NameStep = ({ userName, setUserName, handleNextStep }: NameStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          name="name"
          placeholder="Введите ваше имя"
          value={userName}
          onChange={(e) => setUserName(e.target.value.slice(0, 16))}
          onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
          maxLength={16}
          autoComplete="name"
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
          Пожалуйста, указывайте своё настоящее имя
        </p>
      </div>
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={!userName.trim()}
      >
        Продолжить
        <Icon name="ChevronRight" className="ml-2" size={20} />
      </Button>
    </div>
  );
};

interface EmailStepProps {
  userEmail: string;
  setUserEmail: (value: string) => void;
  handleNextStep: () => void;
  isSending?: boolean;
}

export const EmailStep = ({ userEmail, setUserEmail, handleNextStep, isSending }: EmailStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="email"
          name="email"
          placeholder="example@mail.ru"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && handleNextStep()}
          autoComplete="email"
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
          Мы отправим одноразовый код для подтверждения
        </p>
      </div>
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={!userEmail.trim() || !userEmail.includes('@') || isSending}
      >
        {isSending ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Отправляем код...
          </>
        ) : (
          <>
            Получить код
            <Icon name="Mail" className="ml-2" size={20} />
          </>
        )}
      </Button>
    </div>
  );
};

interface OtpStepProps {
  otpCode: string;
  setOtpCode: (value: string) => void;
  handleNextStep: () => void;
  userEmail: string;
  isVerifying?: boolean;
  otpError?: string;
  onResend: () => void;
  resendTimer: number;
}

export const OtpStep = ({ otpCode, setOtpCode, handleNextStep, userEmail, isVerifying, otpError, onResend, resendTimer }: OtpStepProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = otpCode.padEnd(6, '').split('').slice(0, 6);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpCode(newDigits.join(''));
      if (pasted.length >= 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }
    newDigits[index] = value;
    setOtpCode(newDigits.join(''));
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otpCode.length === 6) {
      handleNextStep();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
        Код отправлен на <span className="font-medium text-gray-900 dark:text-white">{userEmail}</span>
      </p>
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={i === 0 ? 6 : 1}
            value={digits[i] || ''}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-10 h-12 sm:w-11 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
              otpError
                ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white'
            }`}
          />
        ))}
      </div>
      {otpError && (
        <p className="text-sm text-red-500 text-center">{otpError}</p>
      )}
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={otpCode.replace(/\s/g, '').length !== 6 || isVerifying}
      >
        {isVerifying ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Проверяем...
          </>
        ) : (
          <>
            Подтвердить
            <Icon name="Check" className="ml-2" size={20} />
          </>
        )}
      </Button>
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-xs text-gray-400">Отправить повторно через {resendTimer} сек</p>
        ) : (
          <button onClick={onResend} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline">
            Отправить код повторно
          </button>
        )}
      </div>
    </div>
  );
};

export { SEND_OTP_URL, VERIFY_OTP_URL };

interface CityStepProps {
  citySearch: string;
  setCitySearch: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  showCityDropdown: boolean;
  setShowCityDropdown: (value: boolean) => void;
  handleNextStep: () => void;
}

export const CityStep = ({
  citySearch,
  setCitySearch,
  selectedCity,
  setSelectedCity,
  showCityDropdown,
  setShowCityDropdown,
  handleNextStep,
}: CityStepProps) => {
  const [showAll] = useState(false);
  
  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/ё/g, 'е');
  };
  
  const search = normalizeText(citySearch.trim());
  
  const filteredCities = search === '' 
    ? popularCities.slice(0, 20)
    : allCities.filter(city => normalizeText(city).includes(search));

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Начните вводить название города"
          value={selectedCity || citySearch}
          onChange={(e) => {
            setCitySearch(e.target.value);
            setSelectedCity('');
            setShowCityDropdown(true);
          }}
          onFocus={() => setShowCityDropdown(true)}
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {showCityDropdown && (
          <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg">
            {filteredCities.length > 0 ? (
              filteredCities.slice(0, 20).map((city) => (
                <div
                  key={city}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => {
                    setSelectedCity(city);
                    setCitySearch('');
                    setShowCityDropdown(false);
                  }}
                >
                  <div className="text-gray-900 dark:text-white font-medium">{city}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{cityRegions[city]}</div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                Город не найден
              </div>
            )}
          </div>
        )}
      </div>
      <Button
        className="w-full gradient-primary border-0 text-white h-12"
        onClick={handleNextStep}
        disabled={!selectedCity}
      >
        Продолжить
        <Icon name="ChevronRight" className="ml-2" size={20} />
      </Button>
    </div>
  );
};