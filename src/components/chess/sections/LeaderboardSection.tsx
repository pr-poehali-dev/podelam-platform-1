import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PlayerProfileModal from '@/components/chess/PlayerProfileModal';

interface LeaderboardPlayer {
  rank: number;
  name: string;
  rating: number;
  avatar: string;
  highlight?: boolean;
}

interface LeaderboardSectionProps {
  leaderboard: LeaderboardPlayer[];
}

export const LeaderboardSection = ({ leaderboard }: LeaderboardSectionProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardPlayer | null>(null);
  return (
    <div className="animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="Crown" className="text-yellow-500" size={24} />
            Таблица лидеров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-200 dark:bg-slate-800/50">
              <TabsTrigger value="global">Общий рейтинг</TabsTrigger>
              <TabsTrigger value="week">За неделю</TabsTrigger>
              <TabsTrigger value="month">За месяц</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="space-y-3 mt-6">
              {leaderboard.map((player) => (
                <div 
                  key={player.rank}
                  onClick={() => setSelectedPlayer(player)}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                    player.highlight 
                      ? 'bg-slate-100 dark:bg-blue-500/20 border-2 border-slate-300 dark:border-blue-400/50' 
                      : 'bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold w-8 ${
                      player.rank === 1 ? 'text-yellow-400' :
                      player.rank === 2 ? 'text-gray-300' :
                      player.rank === 3 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      #{player.rank}
                    </div>
                    <div className="text-3xl">{player.avatar}</div>
                    <div>
                      <div className={`font-semibold ${player.highlight ? 'text-slate-900 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Рейтинг: {player.rating}</div>
                    </div>
                  </div>
                  {player.rank <= 3 && (
                    <Badge variant="outline" className={`
                      ${player.rank === 1 ? 'border-yellow-400/50 text-yellow-400' : ''}
                      ${player.rank === 2 ? 'border-gray-300/50 text-gray-300' : ''}
                      ${player.rank === 3 ? 'border-orange-400/50 text-orange-400' : ''}
                    `}>
                      <Icon name="Trophy" className="mr-1" size={14} />
                      ТОП-{player.rank}
                    </Badge>
                  )}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="week" className="mt-6">
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="TrendingUp" className="mx-auto mb-4" size={48} />
                <p>Недельная статистика обновляется каждый понедельник</p>
              </div>
            </TabsContent>
            <TabsContent value="month" className="mt-6">
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="Calendar" className="mx-auto mb-4" size={48} />
                <p>Месячная статистика обновляется 1 числа каждого месяца</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <PlayerProfileModal
        open={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        playerName={selectedPlayer?.name || ''}
        playerRating={selectedPlayer?.rating}
      />
    </div>
  );
};