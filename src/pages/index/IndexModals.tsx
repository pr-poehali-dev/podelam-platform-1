import {
  AuthModal,
  GameSettingsModal,
  OfflineGameModal,
} from "@/components/chess/Modals";
import { ConfirmDialog } from "@/pages/game/ConfirmDialog";

interface IndexModalsProps {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  setIsAuthenticated: (value: boolean) => void;
  pendingInviteCode: string | null;
  setShowGameSettings: (value: boolean) => void;
  showGameSettings: boolean;
  onStartGame: (difficulty: string, timeControl: string, color: string) => void;
  onStartOnlineGame: (opponentType: string, timeControl: string, color: string) => void;
  showOfflineGameModal: boolean;
  setShowOfflineGameModal: (value: boolean) => void;
  onOfflineRegister: (data: { day: string; time: string; district?: string }) => void;
  offlineRegMsg: string | null;
  setOfflineRegMsg: (msg: string | null) => void;
  initialOpponent?: 'friend' | 'computer' | null;
}

const IndexModals = ({
  showAuthModal,
  setShowAuthModal,
  setIsAuthenticated,
  pendingInviteCode,
  setShowGameSettings,
  showGameSettings,
  onStartGame,
  onStartOnlineGame,
  showOfflineGameModal,
  setShowOfflineGameModal,
  onOfflineRegister,
  offlineRegMsg,
  setOfflineRegMsg,
  initialOpponent,
}: IndexModalsProps) => {
  return (
    <>
      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        setIsAuthenticated={setIsAuthenticated}
        setShowGameSettings={pendingInviteCode ? () => {} : setShowGameSettings}
      />

      <GameSettingsModal
        showGameSettings={showGameSettings}
        setShowGameSettings={setShowGameSettings}
        onStartGame={onStartGame}
        onStartOnlineGame={onStartOnlineGame}
        initialOpponent={initialOpponent}
      />

      <OfflineGameModal
        showModal={showOfflineGameModal}
        setShowModal={setShowOfflineGameModal}
        onRegister={onOfflineRegister}
      />

      <ConfirmDialog
        open={!!offlineRegMsg}
        message={offlineRegMsg || ""}
        title="Регистрация"
        variant="info"
        alertOnly
        onConfirm={() => setOfflineRegMsg(null)}
        onCancel={() => setOfflineRegMsg(null)}
      />
    </>
  );
};

export default IndexModals;