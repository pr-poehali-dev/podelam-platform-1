import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Friend, PendingRequest, FriendProfile, FriendGame, FRIENDS_URL } from './friends/FriendTypes';
import { FriendProfileView } from './friends/FriendProfileView';
import { FriendInvitePanel } from './friends/FriendInvitePanel';
import { FriendListPanel } from './friends/FriendListPanel';
import { emitBadge } from '@/lib/badgeEvents';

interface FriendsSectionProps {
  onOpenChat?: (friendName: string, friendRating: number, friendId: string) => void;
  pendingInviteCode?: string | null;
  onInviteProcessed?: () => void;
}

export const FriendsSection = ({ onOpenChat, pendingInviteCode, onInviteProcessed }: FriendsSectionProps) => {
  const [userId, setUserId] = useState('');
  const [userCode, setUserCode] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [friendCode, setFriendCode] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [friendGames, setFriendGames] = useState<FriendGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const getUserId = useCallback(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return '';
    const user = JSON.parse(savedUser);
    const rawId = user.email || user.name || 'anonymous';
    return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
  }, []);

  const fetchMyCode = useCallback(async (uid: string) => {
    const saved = localStorage.getItem('chessUser');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.userId) { setUserCode(u.userId); return; }
      } catch { /* ignore */ }
    }
    try {
      const res = await fetch(`${FRIENDS_URL}?action=my_code&user_id=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (data.code) {
        setUserCode(data.code);
        if (saved) {
          const u = JSON.parse(saved);
          u.userId = data.code;
          localStorage.setItem('chessUser', JSON.stringify(u));
        }
      }
    } catch { /* network error */ }
  }, []);

  const fetchFriends = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`${FRIENDS_URL}?action=list&user_id=${encodeURIComponent(uid)}`);
      const data = await res.json();
      setFriends(data.friends || []);
    } catch { /* network error */ }
    setLoading(false);
  }, []);

  const fetchPending = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`${FRIENDS_URL}?action=pending&user_id=${encodeURIComponent(uid)}`);
      const data = await res.json();
      const pending = data.pending || [];
      setPendingRequests(pending);
      emitBadge({ friends: pending.length });
    } catch { /* network error */ }
  }, []);

  const sendHeartbeat = useCallback(async (uid: string) => {
    fetch(`${FRIENDS_URL}?action=heartbeat&user_id=${encodeURIComponent(uid)}`).catch(() => {});
  }, []);

  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;
    setUserId(uid);
    (async () => {
      try {
        const res = await fetch(`${FRIENDS_URL}?action=init&user_id=${encodeURIComponent(uid)}`);
        const data = await res.json();
        if (data.code) {
          setUserCode(data.code);
          const saved = localStorage.getItem('chessUser');
          if (saved) {
            try { const u = JSON.parse(saved); u.userId = data.code; localStorage.setItem('chessUser', JSON.stringify(u)); } catch {}
          }
        }
        setFriends(data.friends || []);
        const pending = data.pending || [];
        setPendingRequests(pending);
        emitBadge({ friends: pending.length });
      } catch {}
      setLoading(false);
    })();

    const heartbeatInterval = setInterval(() => sendHeartbeat(uid), 120000);
    const refreshInterval = setInterval(() => { fetchFriends(uid); fetchPending(uid); }, 120000);
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(refreshInterval);
    };
  }, [getUserId, fetchMyCode, fetchFriends, fetchPending, sendHeartbeat]);

  useEffect(() => {
    if (pendingInviteCode && userId) {
      setFriendCode(pendingInviteCode);
      setShowAddFriend(true);
      handleAddFriendByCode(pendingInviteCode);
      if (onInviteProcessed) onInviteProcessed();
    }
  }, [pendingInviteCode, userId]);

  const handleAddFriendByCode = async (code?: string) => {
    const codeToAdd = (code || friendCode).trim();
    if (!codeToAdd) return;
    setAddError('');
    setAddSuccess('');

    try {
      const res = await fetch(FRIENDS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', user_id: userId, friend_code: codeToAdd })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'pending' || data.status === 'confirmed')) {
        const msg = data.status === 'confirmed'
          ? `${data.friend.username} добавлен в друзья!`
          : `Заявка отправлена ${data.friend.username}. Ожидайте подтверждения.`;
        setAddSuccess(msg);
        setFriendCode('');
        fetchFriends(userId);
        fetchPending(userId);
        setTimeout(() => { setAddSuccess(''); setShowAddFriend(false); }, 3000);
      } else {
        if (data.error === 'Already friends') setAddError('Уже в списке друзей');
        else if (data.error === 'User not found') setAddError('Пользователь не найден');
        else if (data.error === 'Cannot add yourself') setAddError('Нельзя добавить себя');
        else setAddError(data.error || 'Ошибка');
      }
    } catch {
      setAddError('Ошибка сети');
    }
  };

  const acceptRequest = async (friendId: string) => {
    await fetch(FRIENDS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', user_id: userId, friend_id: friendId })
    });
    fetchFriends(userId);
    fetchPending(userId);
  };

  const rejectRequest = async (friendId: string) => {
    await fetch(FRIENDS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', user_id: userId, friend_id: friendId })
    });
    fetchPending(userId);
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm('Удалить из друзей?')) return;
    await fetch(FRIENDS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', user_id: userId, friend_id: friendId })
    });
    fetchFriends(userId);
  };

  const openFriendProfile = async (friend: Friend) => {
    setSelectedFriend({ id: friend.id, username: friend.username, avatar: friend.avatar || '', rating: friend.rating, city: friend.city || '', games_played: 0, wins: 0, losses: 0, draws: 0 });
    setLoadingGames(true);
    setFriendGames([]);
    const [profileRes, gamesRes] = await Promise.all([
      fetch(`${FRIENDS_URL}?action=profile&user_id=${userId}&friend_id=${encodeURIComponent(friend.id)}`),
      fetch(`${FRIENDS_URL}?action=friend_games&user_id=${userId}&friend_id=${encodeURIComponent(friend.id)}`)
    ]);
    const profileData = await profileRes.json();
    const gamesData = await gamesRes.json();
    setSelectedFriend(profileData.user || null);
    setFriendGames(gamesData.games || []);
    setLoadingGames(false);
  };

  if (selectedFriend) {
    return (
      <FriendProfileView
        selectedFriend={selectedFriend}
        friendGames={friendGames}
        loadingGames={loadingGames}
        onBack={() => { setSelectedFriend(null); setFriendGames([]); }}
      />
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto w-full overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 overflow-hidden flex flex-col flex-1 min-h-0">
        <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 flex flex-col flex-1 min-h-0 overflow-y-auto">
          <FriendInvitePanel
            userCode={userCode}
            friendCode={friendCode}
            setFriendCode={setFriendCode}
            showAddFriend={showAddFriend}
            setShowAddFriend={setShowAddFriend}
            addError={addError}
            setAddError={setAddError}
            addSuccess={addSuccess}
            onAddFriend={handleAddFriendByCode}
            isMobile={isMobile}
          />

          <FriendListPanel
            friends={friends}
            pendingRequests={pendingRequests}
            loading={loading}
            onAcceptRequest={acceptRequest}
            onRejectRequest={rejectRequest}
            onRemoveFriend={removeFriend}
            onOpenProfile={openFriendProfile}
            onOpenChat={onOpenChat}
          />
        </CardContent>
      </Card>
    </div>
  );
};