import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface TournamentsSectionProps {
  upcomingTournaments: Array<{
    id: number;
    name: string;
    date: string;
    prize: string;
    participants: number;
    format: string;
  }>;
}

export const TournamentsSection = ({ upcomingTournaments }: TournamentsSectionProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 text-slate-900 dark:bg-gradient-to-r dark:from-orange-400 dark:to-purple-500 dark:bg-clip-text dark:text-transparent">
          Предстоящие турниры
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Зарегистрируйтесь и соревнуйтесь за призовой фонд</p>
      </div>

      {upcomingTournaments.map((tournament, index) => (
        <Card 
          key={tournament.id} 
          className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all animate-scale-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-white">{tournament.name}</CardTitle>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                    <Icon name="Calendar" className="mr-1" size={14} />
                    {tournament.date}
                  </Badge>
                  <Badge variant="outline" className="border-green-400/50 text-green-400">
                    <Icon name="DollarSign" className="mr-1" size={14} />
                    {tournament.prize}
                  </Badge>
                  <Badge variant="outline" className="border-purple-400/50 text-purple-400">
                    <Icon name="Users" className="mr-1" size={14} />
                    {tournament.participants} участников
                  </Badge>
                </div>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Формат турнира</div>
                <div className="font-semibold text-gray-900 dark:text-white">{tournament.format}</div>
              </div>
              <Button className="gradient-primary border-0 text-white hover:opacity-90">
                <Icon name="UserPlus" className="mr-2" size={18} />
                Зарегистрироваться
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 border-dashed">
        <CardContent className="py-12 text-center">
          <Icon name="Trophy" className="mx-auto mb-4 text-slate-300 dark:text-gray-500" size={48} />
          <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-gray-300">Хотите создать свой турнир?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Организуйте собственный турнир и пригласите друзей</p>
          <Button variant="outline" className="border-slate-200 dark:border-white/20">
            <Icon name="Plus" className="mr-2" size={18} />
            Создать турнир
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
