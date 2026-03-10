import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RematchModalProps {
  showModal: boolean;
  onAccept: () => void;
  onDecline: (expired?: boolean) => void;
  autoHideSeconds?: number;
}

export const RematchModal = ({ showModal, onAccept, onDecline, autoHideSeconds = 10 }: RematchModalProps) => {
  const [secondsLeft, setSecondsLeft] = useState(autoHideSeconds);

  useEffect(() => {
    if (!showModal) {
      setSecondsLeft(autoHideSeconds);
      return;
    }
    setSecondsLeft(autoHideSeconds);
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showModal, autoHideSeconds, onDecline]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-stone-800 border-stone-700/50 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-center text-white flex items-center justify-center gap-2">
            <Icon name="RotateCcw" size={24} className="text-blue-400" />
            Предложение реванша
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-stone-300 text-lg">
            Ваш соперник предлагает сыграть реванш
          </p>

          <div className="w-full bg-stone-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / autoHideSeconds) * 100}%` }}
            />
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={onAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
            >
              <Icon name="Check" size={24} className="mr-2" />
              Принять
            </Button>
            
            <Button
              onClick={onDecline}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
            >
              <Icon name="X" size={24} className="mr-2" />
              Отклонить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};