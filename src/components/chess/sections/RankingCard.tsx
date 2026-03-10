import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import PlayerProfileModal from "@/components/chess/PlayerProfileModal";
import { shareContent } from "@/lib/share";

interface Player {
  rank: number;
  name: string;
  rating: number;
  city: string;
  highlight?: boolean;
  avatar?: string;
}

interface RankingCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: "blue" | "purple" | "orange";
  topPlayers: Player[];
  fullRanking: Player[];
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  animationDelay: string;
}

const clampName = (name: string, max = 16) =>
  name.length > max ? name.slice(0, max - 1) + "…" : name;

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (
      <>
        {parts[0]}
        <br />
        {parts.slice(1).join(" ")}
      </>
    );
  return <>{name}</>;
};

export const RankingCard = ({
  title,
  subtitle,
  icon,
  iconColor,
  topPlayers,
  fullRanking,
  showModal,
  setShowModal,
  animationDelay,
}: RankingCardProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const top = topPlayers[0];
    if (!top) return;
    const text = `${title}: 1 место — ${top.name} (${top.rating})`;
    const ok = await shareContent({ title: "Лига Шахмат — Рейтинг", text });
    if (ok) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const colorClasses = {
    blue: {
      icon: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-600 dark:bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
      highlight:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30",
      highlightText: "text-blue-900 dark:text-blue-300",
    },
    purple: {
      icon: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-600 dark:bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
      highlight:
        "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-500/30",
      highlightText: "text-purple-900 dark:text-purple-300",
    },
    orange: {
      icon: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-600 dark:bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      hover: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
      highlight:
        "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-500/30",
      highlightText: "text-orange-900 dark:text-orange-300",
    },
  };

  const colors = colorClasses[iconColor];

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  };

  const renderTop4 = () => {
    if (!topPlayers.length) {
      return (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-gray-400">
          Пока нет участников
        </div>
      );
    }
    const first = topPlayers[0];
    const rest = topPlayers.slice(1, 4);

    return (
      <div className="mb-3 sm:mb-4">
        {/* Надписи "1 место" и "2 место" над колонками */}
        <div className="flex gap-3 sm:gap-4 mb-1 sm:mb-2 items-baseline">
          <div className="flex-1 text-center">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 animate-glow-text">
              1 место
            </div>
          </div>
          <div className="text-center" style={{ flex: '0 0 42.5%' }}>
            <div className="text-base sm:text-lg lg:text-xl font-bold text-yellow-400 animate-glow-text">
              2 место
            </div>
          </div>
        </div>

        {/* Карточка 1 места и колонка 2-4 — одинаковая высота */}
        <div className="flex gap-3 sm:gap-4 items-stretch">
          {/* Карточка 1 места */}
          <div className="flex-1 min-w-0">
            <div
              className="relative p-3 sm:p-4 rounded-xl border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 cursor-pointer hover:scale-[1.02] transition-all animate-glow-pulse h-full flex items-center justify-center min-h-[44px]"
              onClick={() => setSelectedPlayer(first)}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-orange-400/10 dark:from-yellow-400/5 dark:to-orange-400/5 pointer-events-none" />
              <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-yellow-400/20 dark:bg-yellow-400/15 blur-md animate-pulse" />
                  {first.avatar ? (
                    <img
                      src={first.avatar}
                      alt={first.name}
                      className="relative w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover ring-2 ring-yellow-400 shadow-lg"
                    />
                  ) : (
                    <div
                      className={`relative w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center font-bold text-base sm:text-xl lg:text-2xl text-white ${colors.bg} ring-2 ring-yellow-400 shadow-lg`}
                    >
                      {getInitials(first.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 w-full">
                  <div className="font-bold text-xs sm:text-sm lg:text-base text-gray-900 dark:text-white leading-tight">
                    {splitName(first.name)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    {first.city}
                  </div>
                  <div
                    className={`text-sm sm:text-lg lg:text-xl font-bold ${colors.text} mt-0.5`}
                  >
                    {first.rating}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Карточка 2 + надпись 3 + карточка 3 + надпись 4 + карточка 4 */}
          <div className="flex flex-col gap-0.5 min-w-0" style={{ flex: '0 0 42.5%' }}>
            {rest.map((player, idx) => (
              <div key={player.rank} className="flex flex-col items-center flex-1 min-h-0">
                {idx > 0 && (
                  <div
                    className={`text-sm sm:text-base lg:text-lg font-bold leading-tight shrink-0 ${player.rank <= 3 ? "text-yellow-400 animate-glow-text" : colors.text}`}
                  >
                    {player.rank} место
                  </div>
                )}
                <div
                  className={`flex flex-col items-center justify-center text-center p-1 sm:p-1.5 rounded-lg sm:rounded-xl cursor-pointer hover:border-amber-400 transition-colors w-full flex-1 min-h-0 ${
                    player.rank === 2
                      ? "border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/15 dark:to-orange-900/15 animate-glow-pulse"
                      : player.rank <= 3
                        ? "border-2 border-yellow-400/60 dark:border-yellow-500/40 bg-yellow-50/50 dark:bg-yellow-900/10"
                        : "border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5"
                  }`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full object-cover mb-0.5"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs text-white ${colors.bg} mb-0.5`}
                    >
                      {getInitials(player.name)}
                    </div>
                  )}
                  <div className="font-semibold text-[8px] sm:text-[10px] lg:text-xs text-gray-900 dark:text-white leading-tight w-full text-center">
                    {splitName(player.name)}
                  </div>
                  <div
                    className={`text-[8px] sm:text-[10px] lg:text-xs font-bold ${colors.text}`}
                  >
                    {player.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPlayer = (player: Player) => {
    return (
      <div
        key={player.rank}
        onClick={() => setSelectedPlayer(player)}
        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors hover:border-amber-400 min-h-[44px] ${
          player.highlight
            ? colors.highlight
            : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5"
        }`}
      >
        <div
          className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[10px] sm:text-xs ${colors.bg} text-white flex-shrink-0`}
        >
          {player.rank}
        </div>
        <div className="flex-shrink-0">
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[9px] sm:text-[10px] text-white ${colors.bg}`}
            >
              {getInitials(player.name)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div
            className={`font-semibold text-[10px] sm:text-xs truncate ${
              player.highlight
                ? colors.highlightText
                : "text-gray-900 dark:text-white"
            }`}
          >
            {splitName(player.name)}
          </div>
          <div className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 truncate">
            {player.city}
          </div>
        </div>
        <div
          className={`text-[10px] sm:text-xs font-bold ${colors.text} flex-shrink-0`}
        >
          {player.rating}
        </div>
      </div>
    );
  };

  return (
    <Card
      className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 animate-scale-in overflow-hidden"
      style={{ animationDelay }}
    >
      <CardHeader className="px-3 pt-3 pb-1.5 sm:px-5 sm:pt-4 sm:pb-2">
        <div className="flex items-start justify-between">
          <CardTitle
            className={
              subtitle
                ? "flex flex-col gap-0.5 text-gray-900 dark:text-white"
                : "flex items-center gap-2 text-gray-900 dark:text-white"
            }
          >
            {subtitle ? (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Icon name={icon} className={colors.icon} size={16} />
                  <span className="text-sm sm:text-base lg:text-lg">
                    {title}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs lg:text-sm font-normal text-gray-600 dark:text-gray-400">
                  {subtitle}
                </div>
              </>
            ) : (
              <>
                <Icon name={icon} className={colors.icon} size={16} />
                <span className="text-sm sm:text-base lg:text-lg">{title}</span>
              </>
            )}
          </CardTitle>
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-1 flex-shrink-0 active:scale-90 transition-transform"
              title="Поделиться"
            >
              {shared ? (
                <Icon name="Check" size={26} className="text-green-500" />
              ) : (
                <img
                  src="https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/fda3fc12-14e8-4207-b40a-00c3b8683b37.png"
                  alt="Поделиться"
                  className="w-[26px] h-[26px] dark:invert"
                />
              )}
            </button>
            {shared && (
              <div className="absolute -bottom-8 right-0 bg-gray-900 dark:bg-gray-700 text-white text-[10px] sm:text-xs px-2 py-1 rounded-md whitespace-nowrap z-50 animate-fade-in">
                Ссылка скопирована!
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-5 sm:pb-4 pt-0">
        {renderTop4()}
        <Button
          variant="outline"
          className={`w-full border-slate-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 text-xs sm:text-sm min-h-[40px] ${colors.hover}`}
          onClick={() => setShowModal(!showModal)}
        >
          {showModal ? "Скрыть" : "Больше победителей"}
          <Icon
            name={showModal ? "ChevronUp" : "ChevronDown"}
            className="ml-1"
            size={14}
          />
        </Button>

        {showModal && (
          <div className="animate-expand space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
            {fullRanking.slice(4).map(renderPlayer)}
          </div>
        )}
      </CardContent>

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </Card>
  );
};