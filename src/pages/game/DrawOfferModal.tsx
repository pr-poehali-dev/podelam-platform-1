import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DrawOfferModalProps {
  showModal: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const DrawOfferModal = ({ showModal, onAccept, onDecline }: DrawOfferModalProps) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-stone-800 border-stone-700/50 animate-scale-in">
        <CardHeader>
          <CardTitle className="text-center text-white flex items-center justify-center gap-2">
            <Icon name="Handshake" size={24} className="text-blue-400" />
            Предложение ничьей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-stone-300 text-lg">
            Ваш соперник предлагает завершить партию ничьей
          </p>
          
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