import { RankingCard } from "../RankingCard";
import type { LeaderboardPlayer } from "./useHomeData";

interface HomeRankingsProps {
  userCity: string;
  userRegion: string;
  topRussia: LeaderboardPlayer[];
  topRegion: LeaderboardPlayer[];
  topCity: LeaderboardPlayer[];
  activeRussiaRanking: LeaderboardPlayer[];
  activeRegionRanking: LeaderboardPlayer[];
  activeCityRanking: LeaderboardPlayer[];
  showRussiaModal: boolean;
  setShowRussiaModal: (value: boolean) => void;
  showRegionModal: boolean;
  setShowRegionModal: (value: boolean) => void;
  showCityModal: boolean;
  setShowCityModal: (value: boolean) => void;
}

export const HomeRankings = ({
  userCity,
  userRegion,
  topRussia,
  topRegion,
  topCity,
  activeRussiaRanking,
  activeRegionRanking,
  activeCityRanking,
  showRussiaModal,
  setShowRussiaModal,
  showRegionModal,
  setShowRegionModal,
  showCityModal,
  setShowCityModal,
}: HomeRankingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-1 sm:px-0">
      <RankingCard
        title="Лучшие в России"
        subtitle="Лидеры страны"
        icon="Globe"
        iconColor="blue"
        topPlayers={topRussia}
        fullRanking={activeRussiaRanking}
        showModal={showRussiaModal}
        setShowModal={setShowRussiaModal}
        animationDelay="0s"
      />

      <RankingCard
        title="Первые в регионе"
        subtitle={userRegion}
        icon="Map"
        iconColor="purple"
        topPlayers={topRegion}
        fullRanking={activeRegionRanking}
        showModal={showRegionModal}
        setShowModal={setShowRegionModal}
        animationDelay="0.1s"
      />

      <RankingCard
        title="Победители в городе"
        subtitle={userCity}
        icon="Home"
        iconColor="orange"
        topPlayers={topCity}
        fullRanking={activeCityRanking}
        showModal={showCityModal}
        setShowModal={setShowCityModal}
        animationDelay="0.2s"
      />
    </div>
  );
};

export default HomeRankings;