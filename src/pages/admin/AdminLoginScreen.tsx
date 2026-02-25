import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ADMIN_URL, SETTINGS_URL } from "./types";

type ResetStep = "idle" | "requested" | "confirm" | "done";

interface AdminLoginScreenProps {
  onLogin: (token: string) => void;
}

export default function AdminLoginScreen({ onLogin }: AdminLoginScreenProps) {
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [resetStep, setResetStep] = useState<ResetStep>("idle");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    const res = await fetch(ADMIN_URL, {
      headers: { "X-Admin-Token": password },
    });
    setLoading(false);
    if (res.status === 403) {
      setLoginError("Неверный пароль");
      return;
    }
    sessionStorage.setItem("admin_token", password);
    onLogin(password);
  };

  const handleResetRequest = async () => {
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch(SETTINGS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_request" }),
      });
      const data = await res.json();
      if (data.error) {
        setResetError(data.error);
      } else {
        setResetEmail(data.masked_email || "");
        setResetStep("confirm");
      }
    } catch {
      setResetError("Ошибка соединения");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch(SETTINGS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_confirm", code: resetCode, new_password: resetNewPassword }),
      });
      const data = await res.json();
      if (data.error) {
        setResetError(data.error);
      } else {
        setResetStep("done");
      }
    } catch {
      setResetError("Ошибка соединения");
    } finally {
      setResetLoading(false);
    }
  };

  const resetFlowBack = () => {
    setResetStep("idle");
    setResetEmail("");
    setResetCode("");
    setResetNewPassword("");
    setResetError("");
  };

  if (resetStep === "confirm") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
              <Icon name="KeyRound" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Сброс пароля</h1>
              <p className="text-xs text-muted-foreground">Код отправлен на {resetEmail}</p>
            </div>
          </div>
          <form onSubmit={handleResetConfirm} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={resetCode}
              onChange={e => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-значный код"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            <input
              type="password"
              value={resetNewPassword}
              onChange={e => setResetNewPassword(e.target.value)}
              placeholder="Новый пароль"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {resetError && <p className="text-destructive text-sm">{resetError}</p>}
            <button
              type="submit"
              disabled={resetLoading || resetCode.length !== 6 || !resetNewPassword}
              className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {resetLoading ? "Проверка..." : "Сменить пароль"}
            </button>
            <button
              type="button"
              onClick={resetFlowBack}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Назад к входу
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (resetStep === "done") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-border text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={24} className="text-green-600" />
          </div>
          <h1 className="font-bold text-foreground text-lg mb-2">Пароль изменён</h1>
          <p className="text-sm text-muted-foreground mb-6">Теперь вы можете войти с новым паролем</p>
          <button
            onClick={resetFlowBack}
            className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Перейти к входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
            <Icon name="ShieldCheck" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">Панель администратора</h1>
            <p className="text-xs text-muted-foreground">Введите пароль для входа</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Пароль администратора"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          {loginError && <p className="text-destructive text-sm">{loginError}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setResetStep("requested");
              handleResetRequest();
            }}
            disabled={resetLoading}
            className="text-sm text-primary hover:underline transition-colors"
          >
            {resetLoading ? "Отправка..." : "Забыли пароль?"}
          </button>
          {resetError && resetStep === "requested" && (
            <p className="text-destructive text-sm mt-2">{resetError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
