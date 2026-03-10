import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NotificationsSection } from '@/components/chess/sections/NotificationsSection';

interface NotificationsModalProps {
  showModal: boolean;
  onClose: () => void;
}

export const NotificationsModal = ({ showModal, onClose }: NotificationsModalProps) => {
  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-2xl bg-stone-800 border-stone-700/50 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b border-stone-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Icon name="Bell" size={24} className="text-blue-400" />
              Уведомления
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-100"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto">
          <div className="p-4">
            <NotificationsSection />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
