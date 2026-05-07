import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SEGMENT_NAMES } from "@/components/psych-bot/psychBotData";

interface ShareResultProps {
  profileName: string;
  topSeg: string;
  topMotivation: string;
}

export default function ShareResult({ profileName, topSeg, topMotivation }: ShareResultProps) {
  const [copied, setCopied] = useState(false);

  const segName = SEGMENT_NAMES[topSeg] ?? topSeg;
  const shareText = `Прошёл психологический тест на призвание — мой профиль «${profileName}».\nНаправление: ${segName}${topMotivation ? ` · ${topMotivation}` : ""}.\n\nУзнай свой профиль → https://poehali.dev`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = shareText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=https://poehali.dev&text=${encodeURIComponent(`Прошёл тест на призвание — мой профиль «${profileName}» (${segName}). Узнай свой:`)}`;
    window.open(url, "_blank");
  };

  const handleVK = () => {
    const url = `https://vk.com/share.php?url=https://poehali.dev&title=${encodeURIComponent(`Мой профиль: «${profileName}»`)}&comment=${encodeURIComponent(`Направление: ${segName}. Узнай свой профиль!`)}`;
    window.open(url, "_blank");
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
          <Icon name="Share2" size={16} className="text-violet-600" />
        </div>
        <h3 className="font-bold text-foreground">Поделиться результатом</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-10">Покажи друзьям — пусть тоже узнают свой профиль</p>

      {/* Превью текста */}
      <div className="bg-[hsl(248,50%,98%)] rounded-xl p-3 mb-4 border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
        {shareText}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTelegram}
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-[#229ED9] text-white hover:opacity-90 transition-opacity"
        >
          <Icon name="Send" size={15} />
          Telegram
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
        >
          <Icon name="MessageCircle" size={15} />
          WhatsApp
        </button>
        <button
          onClick={handleVK}
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-[#0077FF] text-white hover:opacity-90 transition-opacity"
        >
          <Icon name="Users" size={15} />
          ВКонтакте
        </button>
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold border-2 transition-all ${copied ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-border text-foreground hover:bg-secondary"}`}
        >
          <Icon name={copied ? "Check" : "Copy"} size={15} />
          {copied ? "Скопировано!" : "Скопировать"}
        </button>
      </div>
    </div>
  );
}
