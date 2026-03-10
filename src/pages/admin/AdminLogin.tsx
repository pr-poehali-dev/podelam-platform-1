import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import API from '@/config/api';

const SEND_OTP_URL = API.sendOtp;
const VERIFY_OTP_URL = API.verifyOtp;
const ADMIN_AUTH_URL = API.adminAuth;

const AdminLogin = ({ onSuccess }: { onSuccess: (email: string) => void }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(() => localStorage.getItem('adminEmail') || '');
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const sendOtp = useCallback(async () => {
    setIsSending(true);
    setError('');
    try {
      const res = await fetch(SEND_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setResendTimer(60);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Не удалось отправить код');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setIsSending(false);
    }
  }, [email]);

  const verifyOtp = useCallback(async () => {
    setIsVerifying(true);
    setError('');
    try {
      const verifyRes = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode.trim(), mode: 'admin' })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        if (verifyData.error === 'Invalid code') {
          setError('Неверный код');
        } else if (verifyData.error === 'Code expired or not found') {
          setError('Код истёк. Запросите новый.');
        } else {
          setError(verifyData.message || verifyData.error || 'Ошибка проверки');
        }
        return;
      }

      const authRes = await fetch(ADMIN_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const authData = await authRes.json();
      if (authRes.ok && authData.success) {
        const adminEmail = email.trim().toLowerCase();
        localStorage.setItem('adminAuth', JSON.stringify({ email: adminEmail, ts: Date.now() }));
        localStorage.setItem('adminEmail', adminEmail);
        onSuccess(adminEmail);
      } else {
        setError(authData.message || 'Нет доступа к админ-панели');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setIsVerifying(false);
    }
  }, [email, otpCode, onSuccess]);

  const digits = otpCode.padEnd(6, '').split('').slice(0, 6);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || '';
      setOtpCode(newDigits.join(''));
      if (pasted.length >= 6) inputRefs.current[5]?.focus();
      return;
    }
    newDigits[index] = value;
    setOtpCode(newDigits.join(''));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter' && otpCode.replace(/\s/g, '').length === 6) verifyOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Icon name="Shield" size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
          <p className="text-slate-400 mt-1">Войдите с помощью одноразового кода</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 space-y-4">
          {step === 'email' && (
            <>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Email администратора</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && email.includes('@') && sendOtp()}
                  placeholder="admin@example.com"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 border-0"
                onClick={sendOtp}
                disabled={!email.includes('@') || isSending}
              >
                {isSending ? (
                  <><Icon name="Loader2" className="mr-2 animate-spin" size={20} />Отправляем код...</>
                ) : (
                  <><Icon name="Mail" className="mr-2" size={20} />Получить код</>
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <p className="text-sm text-slate-300 text-center">
                Код отправлен на <span className="font-medium text-white">{email}</span>
              </p>
              <div className="flex justify-center gap-2">
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
                    className={`w-11 h-14 text-center text-2xl font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${
                      error
                        ? 'border-red-500 bg-red-900/20 text-red-400'
                        : 'border-slate-600 bg-slate-700/50 text-white'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 border-0"
                onClick={verifyOtp}
                disabled={otpCode.replace(/\s/g, '').length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <><Icon name="Loader2" className="mr-2 animate-spin" size={20} />Проверяем...</>
                ) : (
                  <><Icon name="Check" className="mr-2" size={20} />Войти</>
                )}
              </Button>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setStep('email'); setOtpCode(''); setError(''); }}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Изменить email
                </button>
                {resendTimer > 0 ? (
                  <span className="text-xs text-slate-500">Повторно через {resendTimer} сек</span>
                ) : (
                  <button
                    onClick={() => { setOtpCode(''); setError(''); sendOtp(); }}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Отправить повторно
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;