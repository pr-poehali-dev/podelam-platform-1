import { useHomeData } from "./home/useHomeData";
import { HomeActionButtons } from "./home/HomeActionButtons";
import { HomeRankings } from "./home/HomeRankings";

interface HomeSectionProps {
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
  setShowOfflineGameModal: (value: boolean) => void;
  setInitialOpponent: (value: 'friend' | 'computer' | null) => void;
}

export const HomeSection = ({
  isAuthenticated,
  setShowGameSettings,
  setShowAuthModal,
  setShowOfflineGameModal,
  setInitialOpponent,
}: HomeSectionProps) => {
  const {
    userCity,
    userRegion,
    siteSettings,
    lockedMessage,
    setLockedMessage,
    isButtonVisible,
    isLevelAllowed,
    showRussiaModal,
    setShowRussiaModal,
    showRegionModal,
    setShowRegionModal,
    showCityModal,
    setShowCityModal,
    topRussia,
    topRegion,
    topCity,
    activeRussiaRanking,
    activeRegionRanking,
    activeCityRanking,
  } = useHomeData();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in overflow-hidden max-w-full">
      <HomeActionButtons
        isAuthenticated={isAuthenticated}
        setShowGameSettings={setShowGameSettings}
        setShowAuthModal={setShowAuthModal}
        setShowOfflineGameModal={setShowOfflineGameModal}
        setInitialOpponent={setInitialOpponent}
        siteSettings={siteSettings}
        isButtonVisible={isButtonVisible}
        isLevelAllowed={isLevelAllowed}
        lockedMessage={lockedMessage}
        setLockedMessage={setLockedMessage}
      />

      {isButtonVisible("btn_rankings") && (
        <HomeRankings
          userCity={userCity}
          userRegion={userRegion}
          topRussia={topRussia}
          topRegion={topRegion}
          topCity={topCity}
          activeRussiaRanking={activeRussiaRanking}
          activeRegionRanking={activeRegionRanking}
          activeCityRanking={activeCityRanking}
          showRussiaModal={showRussiaModal}
          setShowRussiaModal={setShowRussiaModal}
          showRegionModal={showRegionModal}
          setShowRegionModal={setShowRegionModal}
          showCityModal={showCityModal}
          setShowCityModal={setShowCityModal}
        />
      )}
    </div>
  );
};