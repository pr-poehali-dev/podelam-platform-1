import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface OfflineGameModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  onRegister: (data: { day: string; time: string; district?: string }) => void;
}

const daysOfWeek = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье'
];

const timeSlots = [
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00'
];

const moscowDistricts = [
  'Центральный',
  'Северный',
  'Северо-Восточный',
  'Восточный',
  'Юго-Восточный',
  'Южный',
  'Юго-Западный',
  'Западный',
  'Северо-Западный',
  'Зеленоградский',
  'Новомосковский',
  'Троицкий'
];

const spbDistricts = [
  'Адмиралтейский',
  'Василеостровский',
  'Выборгский',
  'Калининский',
  'Кировский',
  'Колпинский',
  'Красногвардейский',
  'Красносельский',
  'Кронштадтский',
  'Курортный',
  'Московский',
  'Невский',
  'Петроградский',
  'Петродворцовый',
  'Приморский',
  'Пушкинский',
  'Фрунзенский',
  'Центральный'
];

const bigCities = ['Москва', 'Санкт-Петербург'];

export const OfflineGameModal = ({
  showModal,
  setShowModal,
  onRegister
}: OfflineGameModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const savedUser = localStorage.getItem('chessUser');
  const userCity = savedUser ? JSON.parse(savedUser).city : '';
  const needsDistrict = bigCities.includes(userCity);
  
  const districts = userCity === 'Москва' ? moscowDistricts : userCity === 'Санкт-Петербург' ? spbDistricts : [];

  if (!showModal) return null;

  const handleNext = () => {
    if (step === 1 && selectedDay) {
      setStep(2);
    } else if (step === 2 && selectedTime) {
      if (needsDistrict) {
        setStep(3);
      } else {
        handleComplete();
      }
    } else if (step === 3 && selectedDistrict) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onRegister({
      day: selectedDay,
      time: selectedTime,
      district: needsDistrict ? selectedDistrict : undefined
    });
    handleClose();
  };

  const handleClose = () => {
    setShowModal(false);
    setStep(1);
    setSelectedDay('');
    setSelectedTime('');
    setSelectedDistrict('');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const totalSteps = needsDistrict ? 3 : 2;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" 
      onClick={handleClose}
    >
      <Card 
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            {step > 1 && (
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
              {step === 1 && 'Выберите день недели'}
              {step === 2 && 'Выберите время'}
              {step === 3 && 'Выберите район'}
            </CardTitle>
            {step > 1 && <div className="w-10" />}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  step > index ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Когда вам удобно играть?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-4 rounded-lg border-2 transition-all text-center font-medium ${
                      selectedDay === day
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                В какое время?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-4 rounded-lg border-2 transition-all text-center font-medium ${
                      selectedTime === time
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && needsDistrict && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                В каком районе вы находитесь?
              </p>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {districts.map((district) => (
                  <button
                    key={district}
                    onClick={() => setSelectedDistrict(district)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                      selectedDistrict === district
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedDay) ||
              (step === 2 && !selectedTime) ||
              (step === 3 && needsDistrict && !selectedDistrict)
            }
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            {step === totalSteps ? 'Зарегистрироваться' : 'Далее'}
          </Button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Мы свяжемся с вами для подтверждения участия
          </p>
        </CardContent>
      </Card>
    </div>
  );
};