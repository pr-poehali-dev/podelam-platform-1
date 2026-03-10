import {
  HomeSection,
  ProfileSection,
  LeaderboardSection,
  TournamentsSection,
  FriendsSection,
  NotificationsSection,
  HistorySection,
  ChatSection,
} from "@/components/chess/Sections";

interface MainContentProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
  setShowOfflineGameModal: (value: boolean) => void;
  setInitialOpponent: (value: 'friend' | 'computer' | null) => void;
  stats: { games: number; wins: number; rating: number; tournaments: number };
  leaderboard: Array<{ rank: number; name: string; rating: number; avatar: string; highlight?: boolean }>;
  upcomingTournaments: Array<{ id: number; name: string; date: string; prize: string; participants: number; format: string }>;
  chatParams: { name: string; rating: number; id: string } | null;
  setChatParams: (params: { name: string; rating: number; id: string } | null) => void;
  pendingInviteCode: string | null;
  setPendingInviteCode: (code: string | null) => void;
}

const MainContent = ({
  activeSection,
  setActiveSection,
  isAuthenticated,
  setIsAuthenticated,
  setShowGameSettings,
  setShowAuthModal,
  setShowOfflineGameModal,
  setInitialOpponent,
  stats,
  leaderboard,
  upcomingTournaments,
  chatParams,
  setChatParams,
  pendingInviteCode,
  setPendingInviteCode,
}: MainContentProps) => {
  return (
    <main className="container mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-0">
      {activeSection === "home" && (
        <HomeSection
          isAuthenticated={isAuthenticated}
          setShowGameSettings={setShowGameSettings}
          setShowAuthModal={setShowAuthModal}
          setShowOfflineGameModal={setShowOfflineGameModal}
          setInitialOpponent={setInitialOpponent}
        />
      )}

      {activeSection === "profile" && isAuthenticated && (
        <ProfileSection
          stats={stats}
          onLogout={() => {
            localStorage.removeItem("chessUser");
            setIsAuthenticated(false);
            setActiveSection("home");
          }}
        />
      )}

      {activeSection === "leaderboard" && (
        <LeaderboardSection leaderboard={leaderboard} />
      )}

      {activeSection === "tournaments" && (
        <TournamentsSection upcomingTournaments={upcomingTournaments} />
      )}

      {activeSection === "friends" && isAuthenticated && (
        <FriendsSection
          onOpenChat={(name, rating, id) => {
            setChatParams({ name, rating, id });
            setActiveSection("chat");
          }}
          pendingInviteCode={pendingInviteCode}
          onInviteProcessed={() => setPendingInviteCode(null)}
        />
      )}

      {activeSection === "notifications" && isAuthenticated && (
        <NotificationsSection />
      )}

      {activeSection === "history" && isAuthenticated && (
        <HistorySection
          onOpenChat={(name, rating, id) => {
            setChatParams({ name, rating, id });
            setActiveSection("chat");
          }}
        />
      )}

      {activeSection === "chat" && isAuthenticated && (
        <ChatSection
          initialChatId={chatParams?.id}
          initialParticipantName={chatParams?.name}
          initialParticipantRating={chatParams?.rating}
        />
      )}

      {!isAuthenticated &&
        ["profile", "friends", "notifications", "history", "chat"].includes(
          activeSection,
        ) && (
          <HomeSection
            isAuthenticated={isAuthenticated}
            setShowGameSettings={setShowGameSettings}
            setShowAuthModal={setShowAuthModal}
            setShowOfflineGameModal={setShowOfflineGameModal}
            setInitialOpponent={setInitialOpponent}
          />
        )}
    </main>
  );
};

export default MainContent;