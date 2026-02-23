import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Message, Phase, InputMode } from "./diaryEngine";

type Props = {
  messages: Message[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onButtonSelect: (value: string) => void;
  onChipsConfirm: (selected: string[]) => void;
  onSliderConfirm: (value: number) => void;
  onFinish: () => void;
  onStartNew: () => void;
  phase: Phase;
  currentInputMode: InputMode;
  currentButtons?: string[];
  currentChips?: { label: string; group: string }[];
  currentSlider?: { min: number; max: number; label: string };
  bottomRef: React.RefObject<HTMLDivElement>;
  stageNumber: number;
  canAddMore?: boolean;
  onAddMore?: () => void;
  addMoreLabel?: string;
};

export default function DiaryChat({
  messages, input, onInputChange, onSend, onButtonSelect,
  onChipsConfirm, onSliderConfirm, onFinish, onStartNew,
  phase, currentInputMode, currentButtons, currentChips, currentSlider,
  bottomRef, stageNumber, canAddMore, onAddMore, addMoreLabel,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(5);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const toggleChip = (label: string) => {
    setSelectedChips(prev => {
      if (prev.includes(label)) return prev.filter(c => c !== label);
      if (prev.length >= 6) return prev;
      return [...prev, label];
    });
  };

  const confirmChips = () => {
    if (selectedChips.length === 0) return;
    onChipsConfirm(selectedChips);
    setSelectedChips([]);
  };

  const confirmSlider = () => {
    onSliderConfirm(sliderValue);
    setSliderValue(5);
  };

  const isActive = phase !== "done" && phase !== "finishing" && phase !== "intro";
  const showFinishBtn = isActive && stageNumber >= 2;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "bot" && (
                <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Icon name="BookOpen" size={13} className="text-violet-600" />
                </div>
              )}
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.from === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-white border border-border rounded-tl-sm text-foreground"
              }`}>
                {msg.text.split("\n").map((line, i) => {
                  if (line === "") return <div key={i} className="h-2" />;
                  if (line === "---") return <hr key={i} className="border-border my-2" />;
                  const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                  return <p key={i} className={line.startsWith("**") ? "font-semibold" : ""} dangerouslySetInnerHTML={{ __html: bold }} />;
                })}
              </div>
            </div>
          </div>
        ))}

        {phase === "finishing" && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BookOpen" size={13} className="text-violet-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Loader2" size={14} className="animate-spin" />
                Формирую анализ...
              </div>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="flex justify-center pt-3">
            <button
              onClick={onStartNew}
              className="flex items-center gap-2 gradient-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Icon name="PenLine" size={15} />
              Новая запись
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {isActive && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-border px-4 py-3 max-w-2xl mx-auto w-full">
          {currentInputMode === "text" && (
            <>
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите ответ..."
                  rows={1}
                  className="flex-1 resize-none border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-secondary/30 transition-all"
                  style={{ maxHeight: "120px" }}
                />
                <button
                  onClick={onSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
              {canAddMore && onAddMore && (
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={onAddMore}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
                  >
                    <Icon name="SkipForward" size={12} />
                    {addMoreLabel || "Далее"}
                  </button>
                  {showFinishBtn && (
                    <button
                      onClick={onFinish}
                      className="text-xs text-muted-foreground hover:text-violet-600 flex items-center gap-1"
                    >
                      <Icon name="Check" size={12} />
                      Завершить анализ
                    </button>
                  )}
                </div>
              )}
              {!canAddMore && showFinishBtn && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={onFinish}
                    className="text-xs text-muted-foreground hover:text-violet-600 flex items-center gap-1"
                  >
                    <Icon name="Check" size={12} />
                    Завершить анализ
                  </button>
                </div>
              )}
            </>
          )}

          {currentInputMode === "buttons" && currentButtons && (
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentButtons.map(btn => (
                  <button
                    key={btn}
                    onClick={() => onButtonSelect(btn)}
                    className="px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                  >
                    {btn}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSend(); } }}
                  placeholder="Или введите свой вариант..."
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-secondary/30"
                />
                {input.trim() && (
                  <button onClick={onSend} className="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center shrink-0">
                    <Icon name="Send" size={14} />
                  </button>
                )}
              </div>
              {showFinishBtn && (
                <div className="flex justify-end mt-2">
                  <button onClick={onFinish} className="text-xs text-muted-foreground hover:text-violet-600 flex items-center gap-1">
                    <Icon name="Check" size={12} />
                    Завершить анализ
                  </button>
                </div>
              )}
            </div>
          )}

          {currentInputMode === "chips" && currentChips && (
            <div>
              <div className="mb-2">
                <p className="text-xs text-muted-foreground mb-2">Выберите до 6 эмоций:</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-green-600 font-semibold mb-1 uppercase tracking-wider">Позитивные</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentChips.filter(c => c.group === "positive").map(chip => (
                        <button
                          key={chip.label}
                          onClick={() => toggleChip(chip.label)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedChips.includes(chip.label)
                              ? "bg-green-100 text-green-700 ring-2 ring-green-300"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Нейтральные</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentChips.filter(c => c.group === "neutral").map(chip => (
                        <button
                          key={chip.label}
                          onClick={() => toggleChip(chip.label)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedChips.includes(chip.label)
                              ? "bg-gray-200 text-gray-700 ring-2 ring-gray-400"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-red-500 font-semibold mb-1 uppercase tracking-wider">Негативные</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentChips.filter(c => c.group === "negative").map(chip => (
                        <button
                          key={chip.label}
                          onClick={() => toggleChip(chip.label)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedChips.includes(chip.label)
                              ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{selectedChips.length}/6 выбрано</span>
                <button
                  onClick={confirmChips}
                  disabled={selectedChips.length === 0}
                  className="gradient-brand text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          )}

          {currentInputMode === "slider" && currentSlider && (
            <div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{currentSlider.label}</span>
                  <span className="text-lg font-bold text-violet-600">{sliderValue}</span>
                </div>
                <input
                  type="range"
                  min={currentSlider.min}
                  max={currentSlider.max}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-violet-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{currentSlider.min}</span>
                  <span>{currentSlider.max}</span>
                </div>
              </div>
              <button
                onClick={confirmSlider}
                className="w-full gradient-brand text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Подтвердить
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
