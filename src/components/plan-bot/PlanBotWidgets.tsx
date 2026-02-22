import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── РЕНДЕР MARKDOWN ──────────────────────────────────────────────────────────

export function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# ")) {
      return <h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.replace(/^# /, "").replace(/📅\s*/, "")}</h1>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={i} className="text-base font-bold text-gray-900 mt-4 mb-1">{line.replace(/^## /, "")}</h2>;
    }
    if (line.startsWith("### ")) {
      return <h3 key={i} className="text-sm font-semibold text-gray-800 mt-3 mb-1">{line.replace(/^### /, "")}</h3>;
    }
    if (line.startsWith("---")) {
      return <hr key={i} className="my-3 border-gray-200" />;
    }
    if (line.startsWith("> ⚠️") || line.startsWith("> 🕐") || line.startsWith("> ⚡") || line.startsWith("> 🎯") || line.startsWith("> 📈")) {
      return (
        <div key={i} className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 my-2 rounded-r-lg text-sm text-amber-800">
          {line.replace(/^> /, "")}
        </div>
      );
    }
    if (line.startsWith("• ") || line.startsWith("✓ ")) {
      const isCheck = line.startsWith("✓");
      const content = line.replace(/^[•✓] /, "");
      const isExtra = content.startsWith("🔍") || content.startsWith("📈");
      return (
        <p key={i} className={`flex items-start gap-2 text-sm leading-relaxed my-0.5 ${isExtra ? "text-indigo-700" : "text-gray-700"}`}>
          <span className={`mt-1 shrink-0 ${isCheck ? "text-emerald-500" : "text-indigo-400"}`}>{isCheck ? "✓" : "•"}</span>
          <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
        </p>
      );
    }
    if (line.startsWith("*") && line.endsWith("*")) {
      return <p key={i} className="text-xs text-gray-500 italic mt-3">{line.replace(/^\*/, "").replace(/\*$/, "")}</p>;
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;

    const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="text-sm font-semibold text-gray-800 mt-2.5 mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    }
    return <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

// ─── КОМПОНЕНТ СЛАЙДЕРА ───────────────────────────────────────────────────────

export function SliderWidget({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-lg font-bold text-indigo-600">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>1 — минимум</span>
        <span>10 — максимум</span>
      </div>
    </div>
  );
}

// ─── КОМПОНЕНТ ЧИСЛОВОГО ВВОДА ────────────────────────────────────────────────

export function NumberInputWidget({
  placeholder,
  suffix,
  onSubmit,
}: {
  placeholder: string;
  suffix: string;
  onSubmit: (v: number) => void;
}) {
  const [val, setVal] = useState("");
  const isValid = Number(val) > 0;

  return (
    <div className="mt-3 flex gap-2 items-center">
      <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-3 text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && isValid && onSubmit(Number(val))}
        />
        <span className="px-3 text-sm text-gray-500 shrink-0">{suffix}</span>
      </div>
      <button
        onClick={() => isValid && onSubmit(Number(val))}
        disabled={!isValid}
        className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
      >
        <Icon name="Send" size={16} className="text-white" />
      </button>
    </div>
  );
}
