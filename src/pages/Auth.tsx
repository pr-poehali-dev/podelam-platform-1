import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { activatePaidOnce } from "@/lib/access";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const AUTH_URL = "https://functions.poehali.dev/487cc378-edbf-4dee-8e28-4c1fe70b6a3c";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Заполните все поля"); return; }
    if (mode === "register" && !name) { setError("Введите имя"); return; }
    setLoading(true);

    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name, email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Ошибка сервера");
        setLoading(false);
        return;
      }

      const user = data.user;
      localStorage.setItem("pdd_user", JSON.stringify({ id: user.id, name: user.name, email: user.email }));

      const keysToRemove: string[] = [];
      const staleKeys = ["plan_chat", "plan_state", "plan_result", "progress_entries", "progress_chat", "diary_chat", "diary_entries", "pdd_tests"];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.includes(user.email)) keysToRemove.push(k);
        if (staleKeys.includes(k)) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      const results: { test_type: string; score: number; result_data: Record<string, unknown>; created_at: string | null }[] = data.test_results ?? [];

      const testsArr: { id: string; type: string; date: string; score: number }[] = [];

      for (const r of results) {
        if (r.test_type === "career-test" && r.result_data) {
          const rd = r.result_data as Record<string, unknown>;
          const existing = localStorage.getItem(`career_result_${user.email}`);
          const arr = existing ? JSON.parse(existing) : [];
          if (arr.length === 0) {
            arr.push({
              id: Date.now().toString(),
              date: r.created_at ? new Date(r.created_at).toLocaleDateString("ru-RU") : new Date().toLocaleDateString("ru-RU"),
              ...rd,
            });
            localStorage.setItem(`career_result_${user.email}`, JSON.stringify(arr));
          }
        }

        if (r.test_type === "psych-bot" && r.result_data) {
          if (!localStorage.getItem(`psych_result_${user.email}`)) {
            localStorage.setItem(`psych_result_${user.email}`, JSON.stringify(r.result_data));
          }
          activatePaidOnce("psych-bot");
          testsArr.push({
            id: Date.now().toString(),
            type: "Тест на призвание",
            date: r.created_at ? new Date(r.created_at).toLocaleDateString("ru-RU") : new Date().toLocaleDateString("ru-RU"),
            score: r.score ?? 0,
          });
        }

        if (r.test_type === "barrier-bot" && r.result_data) {
          if (!localStorage.getItem(`barrier_results_${user.email}`)) {
            const barrierData = Array.isArray(r.result_data) ? r.result_data : [r.result_data];
            localStorage.setItem(`barrier_results_${user.email}`, JSON.stringify(barrierData));
          }
          activatePaidOnce("barrier-bot");
        }
      }

      localStorage.setItem(`pdd_tests_${user.email}`, JSON.stringify(testsArr));

      navigate("/cabinet");
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-golos gradient-soft flex flex-col">
      <nav className="px-6 h-16 flex items-center">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
            <Icon name="Compass" size={16} className="text-white" />
          </div>
          <span className="font-bold text-[17px] text-foreground">ПоДелам</span>
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-foreground mb-2">
              {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" ? "Войдите, чтобы продолжить путь" : "Начните своё путешествие к себе"}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
            <div className="flex bg-secondary rounded-2xl p-1 mb-6">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {m === "login" ? "Войти" : "Регистрация"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как вас зовут?"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-secondary/30"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-secondary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-secondary/30"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 text-[15px] mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    {mode === "login" ? "Входим..." : "Создаём аккаунт..."}
                  </span>
                ) : (
                  mode === "login" ? "Войти" : "Зарегистрироваться"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                  onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Icon name="Shield" size={12} />
            <span>Данные защищены и не передаются третьим лицам</span>
          </div>
        </div>
      </div>
    </div>
  );
}