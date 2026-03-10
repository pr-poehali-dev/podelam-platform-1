import { Card, CardContent } from '@/components/ui/card';
import useMatchmaking from './online-game/useMatchmaking';
import SearchingScreen from './online-game/SearchingScreen';
import NoMatchScreen from './online-game/NoMatchScreen';
import MatchFoundScreen from './online-game/MatchFoundScreen';

const getTimeLabel = (time: string | null) => {
  if (time && time.includes('+')) {
    const [mins, inc] = time.split('+');
    if (inc === '0') return `${mins} мин`;
    return `${mins}+${inc}`;
  }
  switch(time) {
    case 'blitz': return 'Блиц 3+2';
    case 'rapid': return 'Рапид 10+5';
    case 'classic': return 'Классика 15+10';
    default: return time || 'Неизвестно';
  }
};

const getOpponentTypeLabel = (type: string | null) => {
  switch(type) {
    case 'city': return 'из вашего города';
    case 'region': return 'из вашего региона';
    case 'country': return 'из России';
    default: return '';
  }
};

const OnlineGame = () => {
  const {
    searchStatus,
    searchStage,
    opponent,
    playerColor,
    countdown,
    searchTime,
    opponentType,
    timeControl,
    cancelSearch,
    handlePlayBot,
    handleContinueSearch
  } = useMatchmaking();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-stone-900/80 border-stone-700 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          {searchStatus === 'searching' && (
            <SearchingScreen
              opponentType={opponentType}
              timeControl={timeControl}
              searchTime={searchTime}
              searchStage={searchStage}
              onCancel={cancelSearch}
              getTimeLabel={getTimeLabel}
              getOpponentTypeLabel={getOpponentTypeLabel}
            />
          )}

          {searchStatus === 'no_opponents' && (
            <NoMatchScreen
              onPlayBot={handlePlayBot}
              onContinueSearch={handleContinueSearch}
              onCancel={cancelSearch}
            />
          )}

          {(searchStatus === 'found' || searchStatus === 'starting') && opponent && (
            <MatchFoundScreen
              opponent={opponent}
              playerColor={playerColor}
              countdown={countdown}
              isStarting={searchStatus === 'starting'}
              getTimeLabel={getTimeLabel}
              timeControl={timeControl}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineGame;