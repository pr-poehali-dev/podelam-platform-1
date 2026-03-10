import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface NotificationSettings {
  soundEnabled: boolean;
  popupEnabled: boolean;
  messageSound: boolean;
  friendRequests: boolean;
  gameInvites: boolean;
  tournamentReminders: boolean;
  achievements: boolean;
}

interface Notification {
  id: string;
  type: "friend" | "game" | "tournament" | "achievement";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const NotificationsSection = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    popupEnabled: true,
    messageSound: true,
    friendRequests: true,
    gameInvites: true,
    tournamentReminders: true,
    achievements: true,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "friend",
          title: "Новый запрос в друзья",
          message: "Евгения Малыхина хочет добавить вас в друзья",
          time: "5 минут назад",
          read: false,
        },
        {
          id: "2",
          type: "game",
          title: "Приглашение в игру",
          message: "Костя Шапран приглашает вас сыграть партию",
          time: "15 минут назад",
          read: false,
        },
        {
          id: "3",
          type: "tournament",
          title: "Турнир начинается скоро",
          message: "Чемпионат Быстрых Партий начнется через 1 час",
          time: "1 час назад",
          read: true,
        },
        {
          id: "4",
          type: "achievement",
          title: "Достижение получено!",
          message: 'Вы разблокировали достижение "100 побед"',
          time: "2 часа назад",
          read: true,
        },
      ];
      setNotifications(mockNotifications);
      localStorage.setItem("notifications", JSON.stringify(mockNotifications));
    }
  }, []);

  const handleSettingChange = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend":
        return { name: "UserPlus", color: "text-blue-600 dark:text-blue-400" };
      case "game":
        return { name: "Play", color: "text-green-600 dark:text-green-400" };
      case "tournament":
        return {
          name: "Trophy",
          color: "text-yellow-600 dark:text-yellow-400",
        };
      case "achievement":
        return { name: "Award", color: "text-purple-600 dark:text-purple-400" };
      default:
        return { name: "Bell", color: "text-gray-600 dark:text-gray-400" };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const SettingToggle = ({
    icon,
    title,
    description,
    checked,
    onChange,
  }: {
    icon: string;
    title: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/10">
      <div className="flex items-start gap-3 flex-1">
        <Icon
          name={icon}
          size={20}
          className="text-gray-600 dark:text-gray-400 mt-1"
        />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </div>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
            checked ? "translate-x-7" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Icon
                name="Bell"
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
              Уведомления
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    size="sm"
                    className="border-blue-400/50 text-blue-600 dark:text-blue-400"
                  >
                    <Icon name="CheckCheck" size={16} className="mr-1" />
                    Прочитать все
                  </Button>
                )}
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  className="border-red-400/50 text-red-600 dark:text-red-400"
                >
                  <Icon name="Trash2" size={16} className="mr-1" />
                  Очистить
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="Bell" className="mx-auto mb-4" size={48} />
                <p>Нет уведомлений</p>
                <p className="text-sm">
                  Все уведомления будут отображаться здесь
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const iconData = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                      notification.read
                        ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.read
                          ? "bg-slate-200 dark:bg-slate-700"
                          : "bg-blue-100 dark:bg-blue-800/50"
                      }`}
                    >
                      <Icon
                        name={iconData.name}
                        className={iconData.color}
                        size={20}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Отметить прочитанным
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon
              name="Settings"
              className="text-gray-600 dark:text-gray-400"
              size={24}
            />
            Настройки уведомлений
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Основные настройки
              </h3>
              <div className="space-y-3">
                <SettingToggle
                  icon="Volume2"
                  title="Звуковые уведомления"
                  description="Воспроизводить звук при получении уведомлений"
                  checked={settings.soundEnabled}
                  onChange={() => handleSettingChange("soundEnabled")}
                />
                <SettingToggle
                  icon="MessageSquare"
                  title="Всплывающие окна"
                  description="Показывать информационные окна с уведомлениями"
                  checked={settings.popupEnabled}
                  onChange={() => handleSettingChange("popupEnabled")}
                />
                <SettingToggle
                  icon="MessageCircle"
                  title="Звук сообщений в чате"
                  description="Воспроизводить звук при получении сообщений"
                  checked={settings.messageSound}
                  onChange={() => handleSettingChange("messageSound")}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Типы уведомлений
              </h3>
              <div className="space-y-3">
                <SettingToggle
                  icon="UserPlus"
                  title="Запросы в друзья"
                  description="Уведомления о новых запросах в друзья"
                  checked={settings.friendRequests}
                  onChange={() => handleSettingChange("friendRequests")}
                />
                <SettingToggle
                  icon="Play"
                  title="Приглашения в игру"
                  description="Уведомления о приглашениях сыграть партию"
                  checked={settings.gameInvites}
                  onChange={() => handleSettingChange("gameInvites")}
                />
                <SettingToggle
                  icon="Trophy"
                  title="Напоминания о турнирах"
                  description="Уведомления о предстоящих турнирах"
                  checked={settings.tournamentReminders}
                  onChange={() => handleSettingChange("tournamentReminders")}
                />
                <SettingToggle
                  icon="Award"
                  title="Достижения"
                  description="Уведомления о полученных достижениях"
                  checked={settings.achievements}
                  onChange={() => handleSettingChange("achievements")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
