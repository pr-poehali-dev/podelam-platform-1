import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { SETTINGS_URL } from "./types";

interface AdminSettingsProps {
  token: string;
}

export default function AdminSettings({ token }: AdminSettingsProps) {
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsNewEmail, setSettingsNewEmail] = useState("");
  const [settingsEmailLoading, setSettingsEmailLoading] = useState(false);
  const [settingsEmailMsg, setSettingsEmailMsg] = useState("");
  const [settingsEmailError, setSettingsEmailError] = useState("");

  const [settingsOldPw, setSettingsOldPw] = useState("");
  const [settingsNewPw, setSettingsNewPw] = useState("");
  const [settingsConfirmPw, setSettingsConfirmPw] = useState("");
  const [settingsPwLoading, setSettingsPwLoading] = useState(false);
  const [settingsPwMsg, setSettingsPwMsg] = useState("");
  const [settingsPwError, setSettingsPwError] = useState("");

  useEffect(() => {
    const loadSettingsEmail = async () => {
      try {
        const res = await fetch(SETTINGS_URL, {
          method: "POST",
          headers: { "X-Admin-Token": token, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_config" }),
        });
        const data = await res.json();
        setSettingsEmail(data.email || "");
        setSettingsNewEmail(data.email || "");
      } catch {
        /* ignore */
      }
    };
    loadSettingsEmail();
  }, [token]);

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsEmailLoading(true);
    setSettingsEmailMsg("");
    setSettingsEmailError("");
    try {
      const res = await fetch(SETTINGS_URL, {
        method: "POST",
        headers: { "X-Admin-Token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_email", email: settingsNewEmail }),
      });
      const data = await res.json();
      if (data.error) {
        setSettingsEmailError(data.error);
      } else {
        setSettingsEmail(settingsNewEmail);
        setSettingsEmailMsg("Email обновлён");
      }
    } catch {
      setSettingsEmailError("Ошибка соединения");
    } finally {
      setSettingsEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsPwMsg("");
    setSettingsPwError("");
    if (settingsNewPw !== settingsConfirmPw) {
      setSettingsPwError("Пароли не совпадают");
      return;
    }
    setSettingsPwLoading(true);
    try {
      const res = await fetch(SETTINGS_URL, {
        method: "POST",
        headers: { "X-Admin-Token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", old_password: settingsOldPw, new_password: settingsNewPw }),
      });
      const data = await res.json();
      if (data.error) {
        setSettingsPwError(data.error);
      } else {
        setSettingsPwMsg("Пароль изменён");
        setSettingsOldPw("");
        setSettingsNewPw("");
        setSettingsConfirmPw("");
        sessionStorage.setItem("admin_token", settingsNewPw);
      }
    } catch {
      setSettingsPwError("Ошибка соединения");
    } finally {
      setSettingsPwLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Icon name="Mail" size={18} className="text-violet-700" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Привязка email</h2>
            <p className="text-xs text-muted-foreground">Для восстановления пароля</p>
          </div>
        </div>
        <form onSubmit={handleSaveEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={settingsNewEmail}
              onChange={e => setSettingsNewEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {settingsEmailError && <p className="text-destructive text-sm">{settingsEmailError}</p>}
          {settingsEmailMsg && <p className="text-green-600 text-sm">{settingsEmailMsg}</p>}
          <button
            type="submit"
            disabled={settingsEmailLoading || !settingsNewEmail}
            className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {settingsEmailLoading ? "Сохранение..." : "Сохранить email"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Icon name="Lock" size={18} className="text-violet-700" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Смена пароля</h2>
            <p className="text-xs text-muted-foreground">Обновите пароль администратора</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Текущий пароль</label>
            <input
              type="password"
              value={settingsOldPw}
              onChange={e => setSettingsOldPw(e.target.value)}
              placeholder="Текущий пароль"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Новый пароль</label>
            <input
              type="password"
              value={settingsNewPw}
              onChange={e => setSettingsNewPw(e.target.value)}
              placeholder="Новый пароль"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Подтвердите пароль</label>
            <input
              type="password"
              value={settingsConfirmPw}
              onChange={e => setSettingsConfirmPw(e.target.value)}
              placeholder="Подтвердите новый пароль"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {settingsPwError && <p className="text-destructive text-sm">{settingsPwError}</p>}
          {settingsPwMsg && <p className="text-green-600 text-sm">{settingsPwMsg}</p>}
          <button
            type="submit"
            disabled={settingsPwLoading || !settingsOldPw || !settingsNewPw || !settingsConfirmPw}
            className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {settingsPwLoading ? "Сохранение..." : "Сменить пароль"}
          </button>
        </form>
      </div>
    </div>
  );
}
